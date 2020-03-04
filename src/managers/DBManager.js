import dynamoose from 'dynamoose';

dynamoose.AWS.config.update({ region: 'us-east-1' });

export default class DBManager {
  db;

  constructor(tableName, schema) {
    this.db = dynamoose.model(tableName, schema);
  }

  // eslint-disable-next-line class-methods-use-this
  toDBFormat() {
    throw new Error('Method not implemented.');
  }

  // eslint-disable-next-line class-methods-use-this
  getKey() {
    throw new Error('Method not implemented.');
  }

  // eslint-disable-next-line class-methods-use-this
  fromDBResponse() {
    throw new Error('Method not implemented.');
  }

  async get() {
    const entities = await this.db.scan().exec();
    return entities.map(e => this.fromDBResponse(e));
  }

  async getByKey() {
    const entity = await this.db.get(this.getKey());
    return entity ? this.fromDBResponse(entity) : null;
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
