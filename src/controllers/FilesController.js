import AWS from 'aws-sdk';
import { OK, INTERNAL_SERVER_ERROR } from 'http-status-codes';
import { respond } from '../utils/response';
import File from '../models/File';

export default class FilesController {
  static basePath = '/api/files';

  app;

  s3Client;

  constructor(app) {
    this.app = app;
    this.initialize();
  }

  static mountController(app) {
    return new FilesController(app);
  }

  static createS3Client() {
    return new AWS.S3({
      region: process.env.AWS_REGION || undefined
    });
  }

  initialize() {
    this.app.get(
      `${FilesController.basePath}/list`,
      this.getFilesList.bind(this)
    );
  }

  _listObjects(nextContinuationToken) {
    return new Promise((resolve, reject) => {
      const client = FilesController.createS3Client();

      const params = {
        Bucket: process.env.FILES_S3_BUCKET_NAME
      };

      if (nextContinuationToken) {
        params.NextContinuationToken = nextContinuationToken;
      }

      client.listObjectsV2(params, async (err, data) => {
        if (err) {
          reject(err);
        } else {
          const objects = [
            ...data.Contents.map(item => File.fromS3Item(item)),
            ...(data.NextContinuationToken
              ? await this._listObjects(data.NextContinuationToken)
              : [])
          ];
          resolve(objects);
        }
      });
    });
  }

  /**
   * @api {GET} /api/files/list
   * @apiName Files
   * @apiGroup ListFiles
   *
   * @apiDescription Get a list of all files in the bucket
   *
   * @apiSuccessExample Success-Response
   *
   *  HTTP/1.1 200 OK
   *  [
   *    {
   *      "name": "space.jpg",
   *      "lastModified": "2020-02-10T22:54:55.000Z",
   *      "size": 278635
   *    },
   *    {
   *      "name": "vader-1.jpg",
   *      "lastModified": "2020-02-10T23:43:39.000Z",
   *      "size": 141275
   *    }
   *  ]
   *
   */
  async getFilesList(req, res) {
    try {
      const files = await this._listObjects();
      respond(res, OK, files);
    } catch (e) {
      console.error(e);
      respond(res, INTERNAL_SERVER_ERROR, {
        message: e.message
      });
    }
  }
}
