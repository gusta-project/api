import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';

import { authenticate } from '../modules/auth';
import models from '../modules/database';
import loggers from '../modules/logging';

const router = Router();
const log = loggers('user');
const {
  Flavor,
  Recipe,
  Role,
  User,
  UsersFlavors,
  UserProfile,
  UsersRoles,
  Vendor
} = models;

/**
 * GET User Info
 * @param userId int
 */
router.get(
  '/:userId(\\d+)',
  authenticate(),
  [
    param('userId')
      .isNumeric()
      .isInt({ min: 1 })
      .toInt()
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    log.info(`request for user ${req.params.userId}`);
    try {
      const result = await User.findOne({
        where: {
          id: req.params.userId
        }
      });

      if (!result || result.length === 0) {
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
/* PUT /:userId - Update user info. - still trying to figure out the best approach here
 */

/**
 * GET User Profile
 * @param userId int
 */
router.get(
  '/:userId(\\d+)/profile',
  authenticate(),
  [
    param('userId')
      .isNumeric()
      .isInt({ min: 1 })
      .toInt()
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    log.info(`request for user profile ${req.params.userId}`);
    try {
      const result = await UserProfile.findOne({
        where: {
          userId: req.params.userId
        }
      });

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
 * PUT Update User's Profile
 * @param userId int
 */
router.put(
  '/:userId(\\d+)/profile',
  authenticate(),
  [
    param('userId')
      .isNumeric()
      .isInt({ min: 1 })
      .toInt()
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    log.info(`update user profile ${req.params.userId}`);
    try {
      const result = await UserProfile.update(
        {
          location: req.body.location,
          bio: req.body.bio,
          url: req.body.url
        },
        {
          where: {
            userId: req.params.userId
          }
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
 * GET User Recipes
 * @param userId int
 */
router.get(
  '/:userId(\\d+)/recipes',
  authenticate(),
  [
    param('userId')
      .isNumeric()
      .isInt({ min: 1 })
      .toInt()
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    log.info(`request for user recipes ${req.params.userId}`);
    try {
      const result = await Recipe.findAll({
        where: {
          userId: req.params.userId
        }
      });

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
 * GET User Flavors
 * @param userId int
 */
router.get(
  '/:userId(\\d+)/flavors',
  authenticate(),
  [
    param('userId')
      .isNumeric()
      .isInt({ min: 1 })
      .toInt()
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    log.info(`request flavor stash for user ${req.params.userId}`);
    try {
      const result = await UsersFlavors.findAll({
        where: {
          userId: req.params.userId
        },
        include: [
          {
            model: Flavor,
            required: true,
            include: [
              {
                model: Vendor,
                required: true
              }
            ]
          }
        ]
      });

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
 * GET A User Flavor
 * @param userId int
 * @param flavorId int
 */
router.get(
  '/:userId(\\d+)/flavor/:flavorId(\\d+)',
  authenticate(),
  [
    param('userId')
      .isNumeric()
      .isInt({ min: 1 })
      .toInt(),
    param('flavorId')
      .isNumeric()
      .isInt({ min: 1 })
      .toInt()
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    log.info(
      `request flavor stash flavor id ${req.params.userId} for user ${req.params.userId}`
    );
    try {
      const result = await UsersFlavors.findAll({
        where: {
          userId: req.params.userId,
          flavorId: req.params.flavorId
        },
        include: [
          {
            model: Flavor,
            required: true,
            include: [
              {
                model: Vendor,
                required: true
              }
            ]
          }
        ]
      });

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
 * POST Add Flavor to User's Flavor Stash
 * @param userId int - User ID
 */
router.post(
  '/:userId(\\d+)/flavor',
  authenticate(),
  [
    param('userId')
      .isNumeric()
      .isInt({ min: 1 })
      .toInt()
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    log.info(`create flavor stash for user ${req.params.userId}`);
    try {
      const result = await UsersFlavors.create({
        userId: req.params.userId,
        flavorId: req.body.flavorId,
        created: req.body.created,
        minMillipercent: req.body.minMillipercent,
        maxMillipercent: req.body.maxMillipercent
      });

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
 * PUT Update User's Flavor Stash Entry
 * @param userId int
 * @param flavorId int
 */
router.put(
  '/:userId(\\d+)/flavor/:flavorId(\\d+)',
  authenticate(),
  [
    param('userId')
      .isNumeric()
      .isInt({ min: 1 })
      .toInt(),
    param('flavorId')
      .isNumeric()
      .isInt({ min: 1 })
      .toInt()
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    log.info(`update user ${req.params.userId} flavor ${req.params.flavorId}`);
    try {
      const result = await UsersFlavors.update(
        {
          minMillipercent: req.body.minMillipercent,
          maxMillipercent: req.body.maxMillipercent
        },
        {
          where: {
            userId: req.params.userId,
            flavorId: req.params.flavorId
          }
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
 * DELETE Remove User's Flavor Stash Entry
 * @param userId int
 * @param flavorId int
 */
router.delete(
  '/:userId(\\d+)/flavor/:flavorId(\\d+)',
  authenticate(),
  [
    param('userId')
      .isNumeric()
      .isInt({ min: 1 })
      .toInt(),
    param('flavorId')
      .isNumeric()
      .isInt({ min: 1 })
      .toInt()
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    log.info(`delete from flavor stash for ${req.params.flavorId}`);
    try {
      const result = await UsersFlavors.destroy({
        where: {
          userId: req.params.userId,
          flavorId: req.params.flavorId
        }
      });

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
 * GET User Roles
 * @param userId int
 */
router.get(
  '/:userId(\\d+)/roles',
  authenticate(),
  [
    param('userId')
      .isNumeric()
      .isInt({ min: 1 })
      .toInt()
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    log.info(`request roles for user ${req.params.userId}`);
    try {
      const result = await UsersRoles.findAll({
        where: {
          userId: req.params.userId
        },
        include: [
          {
            model: Role,
            required: true
          }
        ]
      });

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
 * GET A User Role
 * @param userId int
 * @param roleId int
 */
router.get(
  '/:userId(\\d+)/role/:roleId(\\d+)',
  authenticate(),
  [
    param('userId')
      .isNumeric()
      .isInt({ min: 1 })
      .toInt(),
    param('roleId')
      .isNumeric()
      .isInt({ min: 1 })
      .toInt()
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    log.info(
      `request role id ${req.params.roleId} for user ${req.params.userId}`
    );
    try {
      const result = await UsersRoles.findAll({
        where: {
          userId: req.params.userId,
          roleId: req.params.roleId
        },
        include: [
          {
            model: Role,
            required: true
          }
        ]
      });

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
 * POST Add Role to User's Roles
 * @param userId int - User ID
 * @body roleId int
 * @body active boolean
 */
router.post(
  '/:userId(\\d+)/role',
  authenticate(),
  [
    param('userId')
      .isNumeric()
      .isInt({ min: 1 })
      .toInt(),
    body('roleId')
      .isNumeric()
      .isInt({ min: 1 })
      .toInt(),
    body('active').isBoolean()
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    log.info(`add role to user ${req.params.userId}`);
    try {
      const result = await UsersRoles.create({
        userId: req.params.userId,
        roleId: req.body.roleId,
        active: req.body.active || true
      });

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
 * PUT Update User's Role
 * @param userId int
 * @param roleId int
 * @body active boolean
 */
router.put(
  '/:userId(\\d+)/role/:roleId(\\d+)',
  authenticate(),
  [
    param('userId')
      .isNumeric()
      .isInt({ min: 1 })
      .toInt(),
    param('roleId')
      .isNumeric()
      .isInt({ min: 1 })
      .toInt(),
    body('active').isBoolean()
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    log.info(`update user ${req.params.userId} role ${req.params.roleId}`);
    try {
      const result = await UsersRoles.update(
        {
          active: req.body.active
        },
        {
          where: {
            userId: req.params.userId,
            roleId: req.params.roleId
          }
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
 * DELETE Remove User's Role
 * @param userId int
 * @param roleId int
 */
router.delete(
  '/:userId(\\d+)/role/:roleId(\\d+)',
  authenticate(),
  [
    param('userId')
      .isNumeric()
      .isInt({ min: 1 })
      .toInt(),
    param('roleId')
      .isNumeric()
      .isInt({ min: 1 })
      .toInt()
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    log.info(
      `delete from role ${req.params.roleId} from user ${req.params.userId}`
    );
    try {
      const result = await UsersRoles.destroy({
        where: {
          userId: req.params.userId,
          roleId: req.params.roleId
        }
      });

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

export default router;
