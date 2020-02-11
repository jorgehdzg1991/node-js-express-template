import { BAD_REQUEST, OK } from 'http-status-codes';
import { respond } from '../utils/response';
import Controller from '../models/Controller';
import Post from '../models/Post';

export default class PostsController extends Controller {
  static basePath = '/api/posts';

  static mountController(app) {
    return new PostsController(app);
  }

  initialize() {
    this.app.post(`${PostsController.basePath}`, this.createPost);
  }

  // eslint-disable-next-line class-methods-use-this
  async createPost(req, res) {
    try {
      const expectedParams = ['author', 'title', 'content'];
      const validationErrors = [];

      expectedParams.forEach(key => {
        if (!req.body[key]) {
          validationErrors.push(
            `"${key}" parameter was missing in the request.`
          );
        }
      });

      if (validationErrors.length > 0) {
        respond(res, BAD_REQUEST, {
          message: validationErrors.join('\n')
        });
        return;
      }

      const { author, title, content } = req.body;

      const post = Post.newPost(author, title, content);

      await post.create();

      respond(res, OK, post);
    } catch (e) {
      PostsController.handleUnknownError(res, e);
    }
  }
}
