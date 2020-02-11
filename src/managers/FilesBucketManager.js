import AWS from 'aws-sdk';
import File from '../models/File';

export default class FilesBucketManager {
  static presignedUrlExpirationSeconds = 900;

  static _createS3Client() {
    return new AWS.S3({
      region: process.env.AWS_REGION || undefined
    });
  }

  static listObjects(nextContinuationToken) {
    return new Promise((resolve, reject) => {
      const client = FilesBucketManager._createS3Client();

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
              ? await FilesBucketManager.listObjects(data.NextContinuationToken)
              : [])
          ];
          resolve(objects);
        }
      });
    });
  }

  static getPresignedUrl(fileName) {
    const client = FilesBucketManager._createS3Client();
    const params = {
      Bucket: process.env.FILES_S3_BUCKET_NAME,
      Key: fileName,
      ContentType: '',
      Expires: FilesBucketManager.presignedUrlExpirationSeconds
    };
    return client.getSignedUrlPromise('putObject', params);
  }
}
