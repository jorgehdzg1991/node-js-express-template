import { BAD_REQUEST, NOT_FOUND, OK } from 'http-status-codes';
import { respond } from '../utils/response';
import Controller from '../models/Controller';
import Post from '../models/Post';

export default class PostsController extends Controller {
  static basePath = '/api/posts';

  static mountController(app) {
    return new PostsController(app);
  }

  initialize() {
    this.app.get(PostsController.basePath, PostsController.getAllPosts);
    this.app.get(
      `${PostsController.basePath}/:id`,
      PostsController.getPostById
    );
    this.app.post(PostsController.basePath, PostsController.createPost);
    this.app.put(`${PostsController.basePath}/:id`, PostsController.updatePost);
    this.app.delete(
      `${PostsController.basePath}/:id`,
      PostsController.deletePost
    );
  }

  static async getAllPosts(req, res) {
    try {
      const posts = await new Post().get();
      respond(res, OK, posts);
    } catch (e) {
      PostsController.handleUnknownError(res, e);
    }
  }

  static async getPostById(req, res) {
    try {
      const { id } = req.params;
      const post = await new Post(id).getByKey();

      if (!post) {
        respond(res, NOT_FOUND, {
          message: `Post with id ${id} was not found.`
        });
        return;
      }

      respond(res, OK, post);
    } catch (e) {
      PostsController.handleUnknownError(res, e);
    }
  }

  static async createPost(req, res) {
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

  static async updatePost(req, res) {
    try {
      const { id } = req.params;
      const post = await new Post(id).getByKey();

      if (!post) {
        respond(res, NOT_FOUND, {
          message: `Post with id ${id} was not found.`
        });
        return;
      }

      const allowedParameters = ['author', 'title', 'content', 'likeCount'];

      Object.keys(req.body).forEach(key => {
        if (allowedParameters.includes(key)) {
          post[key] = req.body[key];
        }
      });

      post.updatedAt = new Date();

      await post.update();

      respond(res, OK, post);
    } catch (e) {
      PostsController.handleUnknownError(res, e);
    }
  }

  static async deletePost(req, res) {
    try {
      const { id } = req.params;
      await new Post(id).delete();
      respond(res, OK);
    } catch (e) {
      PostsController.handleUnknownError(res, e);
    }
  }
}
