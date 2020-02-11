import { INTERNAL_SERVER_ERROR } from 'http-status-codes';
import { respond } from '../utils/response';

export default class {
  static basePath = '';

  app;

  constructor(app) {
    this.app = app;
    this.initialize();
  }

  // eslint-disable-next-line class-methods-use-this
  initialize() {
    throw new Error('Method not implemented. Please use a proper sub-class.');
  }

  static mountController() {
    throw new Error('Method not implemented. Please use a proper sub-class.');
  }

  static handleUnknownError(res, e) {
    console.error(e);
    respond(res, INTERNAL_SERVER_ERROR, {
      message: e.message
    });
  }
}
