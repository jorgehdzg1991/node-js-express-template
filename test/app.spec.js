import expect from 'expect';
import request from 'supertest';
import { OK } from 'http-status-codes';
import app from '../src/app';

describe('Server App', () => {
  it('Can say hello', done => {
    request(app)
      .get('/api/node-js-express-template/hello')
      .expect('Content-Type', /json/)
      .expect(OK)
      .end((err, res) => {
        if (err) {
          done(err);
        } else {
          const b = res.body;
          expect(b.hello).toBe('world');
          done();
        }
      });
  });
});
