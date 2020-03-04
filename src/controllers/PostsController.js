import { BAD_REQUEST, NOT_FOUND, OK } from 'http-status-codes';
import { respond } from '../utils/response';
import BaseController from './BaseController';
import Post from '../models/Post';

export default class PostsController extends BaseController {
  static basePath = '/api/v1/posts';

  initialize() {
    // GET get posts list
    this.app.get(PostsController.basePath, PostsController.getAllPosts);

    // GET get post by id
    this.app.get(
      `${PostsController.basePath}/:id`,
      PostsController.getPostById
    );

    // POST create a new post
    this.app.post(PostsController.basePath, PostsController.createPost);

    // PUT update existing post
    this.app.put(`${PostsController.basePath}/:id`, PostsController.updatePost);

    // DELETE delete post
    this.app.delete(
      `${PostsController.basePath}/:id`,
      PostsController.deletePost
    );
  }

  static mount(app) {
    return new PostsController(app);
  }

  // Start: Endpoints

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
        respond(res, NOT_FOUND);
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

      expectedParams.forEach(p => {
        if (!req.body[p]) {
          validationErrors.push(`${p} parameter was not found in the request`);
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
        respond(res, NOT_FOUND);
        return;
      }

      const allowedParams = ['author', 'title', 'content', 'likeCount'];

      Object.keys(req.body).forEach(p => {
        if (allowedParams.includes(p)) {
          post[p] = req.body[p];
        }
      });

      post.updatedAt = new Date();

      await post.update();

      respond(res, OK, post);
    } catch (e) {
      PostsController.handleUnknownError(e);
    }
  }

  static async deletePost(req, res) {
    try {
      const { id } = req.params;
      await new Post(id).delete();
      respond(res, OK);
    } catch (e) {
      PostsController.handleUnknownError(e);
    }
  }

  // End: Endpoints
}
