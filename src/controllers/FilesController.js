import AWS from 'aws-sdk';
import { OK, INTERNAL_SERVER_ERROR, BAD_REQUEST } from 'http-status-codes';
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

  static _createS3Client() {
    return new AWS.S3({
      region: process.env.AWS_REGION || undefined
    });
  }

  static _handleUnknownError(res, e) {
    console.error(e);
    respond(res, INTERNAL_SERVER_ERROR, {
      message: e.message
    });
  }

  initialize() {
    this.app.get(
      `${FilesController.basePath}/list`,
      this.getFilesList.bind(this)
    );

    this.app.get(
      `${FilesController.basePath}/upload`,
      this.getNewFileUploadUrl.bind(this)
    );
  }

  _listObjects(nextContinuationToken) {
    return new Promise((resolve, reject) => {
      const client = FilesController._createS3Client();

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

  // eslint-disable-next-line class-methods-use-this
  _getPresignedUrl(fileName, expiration = 900) {
    const client = FilesController._createS3Client();
    const params = {
      Bucket: process.env.FILES_S3_BUCKET_NAME,
      Key: fileName,
      ContentType: '',
      Expires: expiration
    };
    return client.getSignedUrlPromise('putObject', params);
  }

  /**
   * @api {GET} /api/files/list
   * @apiName Files
   * @apiGroup List all files in bucket
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
      FilesController._handleUnknownError(res, e);
    }
  }

  /**
   * @api {GET} /api/files/upload
   * @apiName Files
   * @apiGroup Get presigned upload url
   *
   * @apiDescription Get a presigned S3 url for a new upload
   *
   * @apiParam  {String}  id  Mandatory File name of the new upload
   *
   * @apiSuccess  (200) {String}  url S3 presigned upload url
   *
   * @apiSuccessExample {json}  Success-Response
   *  HTTP/1.1 200 OK
   *  {
   *    "url": "https://jorgehdzg-node-js-express-file-sharing.s3.us-west-2.amazonaws.com/test-file.txt?AWSAccessKeyId=AKIATUGOOFPM4STDN24X&Content-Type=&Expires=1581439981&Signature=bW9YJNxOa6mZ%2FDRd96olZIOX5RY%3D"
   *  }
   */
  async getNewFileUploadUrl(req, res) {
    try {
      const { fileName } = req.query;

      if (!fileName) {
        respond(res, BAD_REQUEST, {
          message: '"fileName" query parameter was missing in the request.'
        });
        return;
      }

      const url = await this._getPresignedUrl(fileName);

      respond(res, OK, { url });
    } catch (e) {
      FilesController._handleUnknownError(res, e);
    }
  }
}
