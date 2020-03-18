import AWS from 'aws-sdk';

export default class FilesManager {
  static _presignedUrlExpirationSeconds = 900;

  static _createS3Client() {
    return new AWS.S3({
      region: 'us-east-1'
    });
  }

  static getPresignedUrl(fileName, operation) {
    const client = FilesManager._createS3Client();

    const params = {
      Bucket: 'jorgehdzg-file-sharing',
      Key: fileName,
      ContentType: '',
      Expires: FilesManager._presignedUrlExpirationSeconds
    };

    return client.getSignedUrlPromise(operation, params);
  }

  static listObjects(nextContinuationToken) {
    return new Promise((resolve, reject) => {
      const client = new FilesManager._createS3Client();

      const params = {
        Bucket: 'jorgehdzg-file-sharing'
      };

      if (nextContinuationToken) {
        params.NextContinuationToken = nextContinuationToken;
      }

      client.listObjectsV2(params, async (err, data) => {
        if (err) {
          reject(err);
        } else {
          const objects = [
            ...data.Contents,
            ...(data.NextContinuationToken
              ? await FilesManager.listObjects(data.NextContinuationToken)
              : [])
          ];
          resolve(objects);
        }
      });
    });
  }

  static getFileContent(key) {
    return new Promise((resolve, reject) => {
      const client = FilesManager._createS3Client();

      const params = {
        Bucket: 'jorgehdzg-file-sharing',
        Key: key
      };

      client.getObject(params, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data.Body.toString());
        }
      });
    });
  }
}
