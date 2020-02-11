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

  get() {
    return this.db.get();
  }

  getByKey() {
    return this.db.get(this.getKey());
  }

  create() {
    return this.db.create(this.toDBFormat());
  }

  update(key) {
    return this.db.update(key, this.toDBFormat());
  }

  delete(key) {
    return this.db.delete(key);
  }
}
