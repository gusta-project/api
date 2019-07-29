import express from 'express';
import request from 'supertest';
import passport from 'passport';
import bodyParser from 'body-parser';
import AnonymousStrategy from 'passport-anonymous';

import preparationRoute from './preparation';
import database from '../modules/database';

describe('preparation route resource', () => {
  const app = express();

  passport.use(new AnonymousStrategy());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(preparationRoute);

  afterAll(() => {
    database.sequelize.close();
  });

  const mockData = {
    recipeId: '17',
    userId: '1',
    volumeMl: '60',
    nicotineMillipercent: '0.0300',
    viewCount: 0,
    PreparationsDiluents: [
      {
        preparationId: '8',
        diluentId: 1,
        millipercent: 300,
        nicotineConcentration: 100
      },
      {
        preparationId: '8',
        diluentId: 1,
        millipercent: 8000,
        nicotineConcentration: 0
      },
      {
        preparationId: '8',
        diluentId: 2,
        millipercent: 1000,
        nicotineConcentration: 0
      }
    ]
  };

  it('can create preparation', done => {
    request(app)
      .post('/')
      .send(mockData)
      .expect('Content-Type', /json/)
      .expect(200, done);
  });

  it('can request valid preparation', done => {
    request(app)
      .get('/123')
      .expect('Content-Type', /json/)
      .expect(200, done);
  });

  it('can update existing preparation', done => {
    request(app)
      .put('/123')
      .send(mockData)
      .expect('Content-Type', /json/)
      .expect(200, done);
  });

  it('can delete existing preparation', done => {
    request(app)
      .delete('/123')
      .expect('Content-Type', /json/)
      .expect(200, done);
  });

  it('returns 400 for invalid number in GET request', done => {
    request(app)
      .get('/0')
      .expect('Content-Type', /json/)
      .expect(400, done);
  });

  it('returns 400 for string in GET request', done => {
    request(app)
      .get('/ham')
      .expect('Content-Type', /json/)
      .expect(400, done);
  });
});
