import expect from 'expect';
import sinon from 'sinon';
import request from 'supertest';
import { OK, INTERNAL_SERVER_ERROR, BAD_REQUEST } from 'http-status-codes';
import S3Stub from './stubs/S3Stub';
import app from '../src/app';
import File from '../src/models/File';
import FilesBucketManager from '../src/managers/FilesBucketManager';

describe('app tests', () => {
  let sandbox;
  let s3Stub;

  const environment = {
    FILES_S3_BUCKET_NAME: 'fake-bucket'
  };

  before(() => {
    sandbox = sinon.createSandbox();
  });

  beforeEach(() => {
    sandbox.stub(process, 'env').value(environment);
    s3Stub = new S3Stub(sandbox);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should list the files in the bucket', done => {
    s3Stub.setListObjectsV2ToSucceed();

    request(app)
      .get('/api/files/list')
      .expect('Content-Type', /json/)
      .expect(OK)
      .end((err, res) => {
        if (err) {
          done(err);
        } else {
          const { body } = res;
          expect(body).toEqual(
            S3Stub.listObjectsV2Response.Contents.map(item =>
              File.fromS3Item(item)
            )
          );
          expect(s3Stub.listObjectsV2Stub.calledOnce).toBe(true);
          expect(s3Stub.listObjectsV2CallArgs()[0]).toEqual({
            Bucket: environment.FILES_S3_BUCKET_NAME
          });
          done();
        }
      });
  });

  it('should continue listing object in the buckets with a next continuation token', done => {
    s3Stub.setListObjectsV2ToSucceedWithNextContinuationToken();

    request(app)
      .get('/api/files/list')
      .expect('Content-Type', /json/)
      .expect(OK)
      .end((err, res) => {
        if (err) {
          done(err);
        } else {
          const { body } = res;
          expect(body).toEqual([
            ...S3Stub.listObjectsV2ResponseWithNextContinuationToken.Contents.map(
              item => File.fromS3Item(item)
            ),
            ...S3Stub.listObjectsV2Response.Contents.map(item =>
              File.fromS3Item(item)
            )
          ]);
          expect(s3Stub.listObjectsV2Stub.calledTwice).toBe(true);
          expect(s3Stub.listObjectsV2CallArgs()[0]).toEqual({
            Bucket: environment.FILES_S3_BUCKET_NAME
          });
          expect(s3Stub.listObjectsV2CallArgs(1)[0]).toEqual({
            Bucket: environment.FILES_S3_BUCKET_NAME,
            NextContinuationToken:
              S3Stub.listObjectsV2ResponseWithNextContinuationToken
                .NextContinuationToken
          });
          done();
        }
      });
  });

  it('should handle listObjectsV2 errors', done => {
    s3Stub.setListObjectsV2ToFail();

    request(app)
      .get('/api/files/list')
      .expect('Content-Type', /json/)
      .expect(INTERNAL_SERVER_ERROR)
      .end((err, res) => {
        if (err) {
          done(err);
        } else {
          const { body } = res;
          expect(body).toEqual({
            message: S3Stub.listObjectsV2ErrorMessage
          });
          expect(s3Stub.listObjectsV2Stub.calledOnce).toBe(true);
          expect(s3Stub.listObjectsV2CallArgs()[0]).toEqual({
            Bucket: environment.FILES_S3_BUCKET_NAME
          });
          done();
        }
      });
  });

  it('should return an S3 signed upload url', done => {
    s3Stub.setGetSignedUrlPromiseToSucceed();

    const fileName = 'fake-file.txt';

    request(app)
      .get(`/api/files/upload?fileName=${fileName}`)
      .expect('Content-Type', /json/)
      .expect(OK)
      .end((err, res) => {
        if (err) {
          done(err);
        } else {
          const { body } = res;
          expect(body).toEqual({
            url: S3Stub.getSignedUrlPromiseResponse
          });
          expect(s3Stub.getSignedUrlPromiseStub.calledOnce).toBe(true);
          expect(s3Stub.getSignedUrlPromiseCallArgs()[0]).toEqual('putObject');
          expect(s3Stub.getSignedUrlPromiseCallArgs()[1]).toEqual({
            Bucket: process.env.FILES_S3_BUCKET_NAME,
            Key: fileName,
            ContentType: '',
            Expires: FilesBucketManager.presignedUrlExpirationSeconds
          });
          done();
        }
      });
  });

  it('should return 400 BadRequest if no fileName is sent', done => {
    s3Stub.setGetSignedUrlPromiseToSucceed();

    request(app)
      .get('/api/files/upload')
      .expect('Content-Type', /json/)
      .expect(BAD_REQUEST)
      .end((err, res) => {
        if (err) {
          done(err);
        } else {
          const { body } = res;
          expect(body).toEqual({
            message: '"fileName" query parameter was missing in the request.'
          });
          expect(s3Stub.getSignedUrlPromiseStub.called).toBe(false);
          done();
        }
      });
  });

  it('should handle get S3 upload url', done => {
    s3Stub.setGetSignedUrlPromiseToFail();

    const fileName = 'fake-file.txt';

    request(app)
      .get(`/api/files/upload?fileName=${fileName}`)
      .expect('Content-Type', /json/)
      .expect(INTERNAL_SERVER_ERROR)
      .end((err, res) => {
        if (err) {
          done(err);
        } else {
          const { body } = res;
          expect(body).toEqual({
            message: S3Stub.getSignedUrlPromiseErrorMessage
          });
          expect(s3Stub.getSignedUrlPromiseStub.calledOnce).toBe(true);
          expect(s3Stub.getSignedUrlPromiseCallArgs()[0]).toEqual('putObject');
          expect(s3Stub.getSignedUrlPromiseCallArgs()[1]).toEqual({
            Bucket: process.env.FILES_S3_BUCKET_NAME,
            Key: fileName,
            ContentType: '',
            Expires: FilesBucketManager.presignedUrlExpirationSeconds
          });
          done();
        }
      });
  });
});
