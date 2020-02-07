import expect from 'expect';
import request from 'supertest';
import { OK } from 'http-status-codes';
import app from '../src/app';

describe('app tests', () => {
  it('can say hello', done => {
    request(app)
      .get('/api/node-js-express-template/hello')
      .expect('Content-Type', /json/)
      .expect(OK)
      .end((err, res) => {
        if (err) {
          done(err);
        } else {
          const { body } = res;
          expect(body.hello).toBe('world');
          done();
        }
      });
  });
});
