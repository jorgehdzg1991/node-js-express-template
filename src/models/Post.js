import uuid from 'uuid/v4';
import DBManager from '../managers/DBManager';

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

  updatedAt;

  createdAt;

  constructor(
    id,
    author,
    title,
    content,
    likeCount,
    updatedAt = new Date(),
    createDate = new Date()
  ) {
    super(process.env.POSTS_TABLE_NAME, postsDBSchema);

    this.id = id;
    this.author = author;
    this.title = title;
    this.content = content;
    this.likeCount = likeCount;
    this.updatedAt = updatedAt;
    this.createdAt = createDate;
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

  static newPost(author, title, content, likeCount = 0) {
    const id = uuid();
    return new Post(id, author, title, content, likeCount);
  }

  // eslint-disable-next-line class-methods-use-this
  fromDBResponse(post) {
    const {
      id,
      author,
      title,
      content,
      likeCount,
      updatedAt,
      createDate
    } = post;

    return new Post(
      id,
      author,
      title,
      content,
      likeCount,
      updatedAt,
      createDate
    );
  }
}
