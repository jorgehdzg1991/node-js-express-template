import dynamoose from 'dynamoose';

dynamoose.AWS.config.update({ region: process.env.AWS_REGION });

export default class DBManager {
  db;

  constructor(tableName, schema) {
    this.db = dynamoose.model(tableName, schema);
  }

  // eslint-disable-next-line class-methods-use-this
  toDBFormat() {
    throw new Error('Method not implemented. Please use a proper sub-class.');
  }

  // eslint-disable-next-line class-methods-use-this
  getKey() {
    throw new Error('Method not implemented. Please use a proper sub-class.');
  }

  // eslint-disable-next-line class-methods-use-this
  fromDBResponse() {
    throw new Error('Method not implemented. Please use a proper sub-class.');
  }

  async get() {
    const posts = await this.db.scan().exec();
    return posts.map(p => this.fromDBResponse(p));
  }

  async getByKey() {
    const post = await this.db.get(this.getKey());
    return post ? this.fromDBResponse(post) : null;
  }

  create() {
    return this.db.create(this.toDBFormat());
  }

  update() {
    return this.db.update(this.getKey(), this.toDBFormat());
  }

  delete() {
    return this.db.delete(this.getKey());
  }
}
