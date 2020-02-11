import { OK, BAD_REQUEST } from 'http-status-codes';
import { respond } from '../utils/response';
import FilesBucketManager from '../managers/FilesBucketManager';
import Controller from '../models/Controller';

export default class FilesController extends Controller {
  static basePath = '/api/files';

  static mountController(app) {
    return new FilesController(app);
  }

  initialize() {
    this.app.get(
      `${FilesController.basePath}/list`,
      FilesController.getFilesList.bind(this)
    );

    this.app.get(
      `${FilesController.basePath}/upload`,
      FilesController.getNewFileUploadUrl.bind(this)
    );
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
  static async getFilesList(req, res) {
    try {
      const files = await FilesBucketManager.listObjects();
      respond(res, OK, files);
    } catch (e) {
      FilesController.handleUnknownError(res, e);
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
  static async getNewFileUploadUrl(req, res) {
    try {
      const { fileName } = req.query;

      if (!fileName) {
        respond(res, BAD_REQUEST, {
          message: '"fileName" query parameter was missing in the request.'
        });
        return;
      }

      const url = await FilesBucketManager.getPresignedUrl(fileName);

      respond(res, OK, { url });
    } catch (e) {
      FilesController.handleUnknownError(res, e);
    }
  }
}
