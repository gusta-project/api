import express from 'express';
import request from 'supertest';
import passport from 'passport';
import AnonymousStrategy from 'passport-anonymous';

import vendor from './vendor';
import database from '../modules/database';

/* eslint-disable camelcase */
describe('vendor route resource', () => {
  const app = express();

  passport.use(new AnonymousStrategy());
  app.use(vendor);

  afterAll(() => {
    database.sequelize.close();
  });

  it('returns valid vendor', done => {
    request(app)
      .get('/1')
      .expect(200, done);
  });

  it('returns 200 for vendor', done => {
    request(app)
      .get('/20000')
      .expect(200, done);
  });

  it('returns 400 for invalid vendor', done => {
    request(app)
      .get('/ham')
      .expect(400, done);
  });
});
