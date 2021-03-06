import { Router } from 'express';
import { body, param } from 'express-validator';

import { authenticate, ensurePermission } from 'modules/auth';
import models from 'modules/database';
import loggers from 'modules/logging';
import {
  handleModelOperation,
  handleValidationErrors
} from 'modules/utils/request';

const router = Router();
const log = loggers('preparation');
const {
  Diluent,
  Flavor,
  Preparation,
  PreparationsDiluents,
  Recipe,
  UserProfile
} = models;

/**
 * GET Preparation
 * @param id int
 */
router.get(
  '/:id',
  authenticate(),
  ensurePermission('preparation', 'read'),
  [param('id').isNumeric().isInt({ min: 1 }).toInt()],
  handleValidationErrors(),
  handleModelOperation(Preparation, 'findOne', (req) => {
    const { id } = req.params;

    log.info(`request for preparation ${id}`);
    return [
      {
        where: {
          id
        },
        include: [
          {
            model: UserProfile,
            required: true
          },
          {
            model: Recipe,
            required: true,
            include: [
              {
                model: Flavor,
                as: 'Flavors'
              },
              {
                model: Diluent,
                as: 'Diluents'
              }
            ]
          },
          {
            model: Diluent,
            as: 'Diluents'
          }
        ]
      }
    ];
  })
);

/**
 * POST Create a Preparation
 * @body recipeId int
 * @body userId int
 * @body volumeMl int
 * @body nicotineMillipercent int
 * @body PreparationsDiluents array
 */
router.post(
  '/',
  authenticate(),
  ensurePermission('preparation', 'create'),
  [
    body('recipeId').isNumeric().toInt(),
    body('userId').isNumeric().toInt(),
    body('volumeMl').isNumeric().toInt(),
    body('nicotineMillipercent').isString(),
    body('PreparationsDiluents').isArray().withMessage('array')
  ],
  handleValidationErrors(),
  async (req, res) => {
    const { recipeId, userId, volumeMl, nicotineMillipercent } = req.body;

    log.info(`request for NEW PREPARATION`);
    try {
      // Check recipe exists
      const recipeCheck = await Recipe.findOne({
        where: {
          id: req.body.recipeId
        }
      });

      if (!recipeCheck) {
        // Recipe doesn't exist
        return res.status(204).end();
      }
      // Create the preparation, with associations
      const result = await Preparation.create(
        {
          recipeId,
          userId,
          volumeMl,
          nicotineMillipercent,
          viewCount: 0,
          PreparationsDiluents: req.body.PreparationsDiluents // Array of diluents
        },
        {
          include: [
            {
              model: PreparationsDiluents,
              required: true
            }
          ]
        }
      );

      if (result.length === 0) {
        return res.status(204).end();
      }

      res.type('application/json');
      res.json(result);
    } catch (error) {
      log.error(error.message);
      res.status(500).send(error.message);
    }
  }
);

/**
 * PUT Update a Preparation
 * - Doesn't allow the Recipe ID or User ID to change
 * @param id int
 * @body volumeMl int
 * @body nicotineMillipercent int
 * @body PreparationsDiluents array
 */
router.put(
  '/:id',
  authenticate(),
  ensurePermission('preparation', 'update'),
  [
    param('id').isNumeric().toInt(),
    body('volumeMl').isNumeric().toInt(),
    body('nicotineMillipercent').isString(),
    body('PreparationsDiluents').isArray().withMessage('array')
  ],
  handleValidationErrors(),
  async (req, res) => {
    const { id } = req.params;

    log.info(`update preparation id ${id}`);
    try {
      // Check Preparation exists
      const preparationCheck = await Preparation.findOne({
        where: {
          id
        }
      });

      if (!preparationCheck) {
        // Preparation doesn't exist
        return res.status(204).end();
      }
      // Update the preparation
      const { volumeMl, nicotineMillipercent } = req.body;
      const preparationResult = await Preparation.update(
        {
          volumeMl,
          nicotineMillipercent
        },
        {
          where: {
            id: req.params.id
          }
        }
      );

      const diluentResult = [];

      for (const diluent of req.body.PreparationsDiluents) {
        if (diluent.millipercent === null) {
          // delete
          diluentResult[diluent.diluentId] = await PreparationsDiluents.destroy(
            {
              where: {
                preparationId: diluent.preparationId,
                diluentId: diluent.diluentId
              }
            }
          );
        } else {
          diluentResult[diluent.diluentId] = await PreparationsDiluents.findOne(
            {
              where: {
                preparationId: diluent.preparationId,
                diluentId: diluent.diluentId
              }
            }
          ).then(async function (obj) {
            if (obj) {
              // update
              return await obj.update({
                millipercent: diluent.millipercent,
                nicotineConcentration: diluent.nicotineConcentration
              });
            } else {
              // insert
              return await PreparationsDiluents.create({
                preparationId: diluent.preparationId,
                diluentId: diluent.diluentId,
                millipercent: diluent.millipercent,
                nicotineConcentration: diluent.nicotineConcentration
              });
            }
          });
        }
      }

      const result = { preparationResult, diluentResult };

      res.type('application/json');
      res.json(result);
    } catch (error) {
      log.error(error.message);
      res.status(500).send(error.message);
    }
  }
);

/**
 * DELETE Preparation
 * @param id int
 */
router.delete(
  '/:id',
  authenticate(),
  ensurePermission('preparation', 'delete'),
  [param('id').isNumeric().toInt()],
  handleValidationErrors(),
  async (req, res) => {
    const { id } = req.params;

    log.info(`delete preparation id ${id}`);
    try {
      // Delete Diluents First
      const diluentResult = await PreparationsDiluents.destroy({
        where: {
          preparationId: req.params.id
        }
      });
      // Once all constraints are deleted, delete recipe
      const preparationResult = await Preparation.destroy({
        where: {
          id
        }
      });

      const result = { preparationResult, diluentResult };

      res.type('application/json');
      res.json(result);
    } catch (error) {
      log.error(error.message);
      res.status(500).send(error.message);
    }
  }
);

export default router;
