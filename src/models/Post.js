import DBManager from '../managers/DBManager';
import uuid from 'uuid/v4';

const postsDBSchema = {
  id: {
    type: String,
    hashKey: true
  },
  author: String,
  title: String,
  content: String,
  likeCount: Number,
  createdAt: String,
  updatedAt: String
};

export default class Post extends DBManager {
  id;

  author;

  title;

  content;

  likeCount;

  createdAt;

  updatedAt;

  constructor(
    id,
    author,
    title,
    content,
    likeCount = 0,
    updatedAt = new Date(),
    createdAt = new Date()
  ) {
    super('jorgehdzg-posts', postsDBSchema);
    this.id = id;
    this.author = author;
    this.title = title;
    this.content = content;
    this.likeCount = likeCount;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  toDBFormat() {
    return {
      ...this,
      updatedAt: this.updatedAt.toString(),
      createdAt: this.createdAt.toString()
    };
  }

  getKey() {
    return this.id;
  }

  // eslint-disable-next-line class-methods-use-this
  fromDBResponse(post) {
    return new Post(
      post.id,
      post.author,
      post.title,
      post.content,
      post.likeCount,
      new Date(post.updatedAt),
      new Date(post.createdAt)
    );
  }

  static newPost(author, title, content) {
    const id = uuid();
    return new Post(id, author, title, content);
  }
}
