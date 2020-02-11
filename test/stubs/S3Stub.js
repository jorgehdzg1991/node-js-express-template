import AWS from 'aws-sdk';

export default class S3Stub {
  static listObjectsV2Response = {
    Contents: [
      {
        Key: 'file-key-1',
        LastModified: 'last-modified-date-1',
        Size: 12345
      },
      {
        Key: 'file-key-2',
        LastModified: 'last-modified-date-2',
        Size: 23456
      }
    ]
  };

  static listObjectsV2ResponseWithNextContinuationToken = {
    Contents: [
      {
        Key: 'file-key-3',
        LastModified: 'last-modified-date-3',
        Size: 12345
      },
      {
        Key: 'file-key-4',
        LastModified: 'last-modified-date-4',
        Size: 23456
      }
    ],
    NextContinuationToken: 'fake-next-continuation-token'
  };

  static listObjectsV2ErrorMessage =
    'Oh no! Something terrible has happened :(';

  s3Stub;

  s3Fakes;

  constructor(sandbox) {
    this.s3Stub = sandbox.stub(AWS, 'S3');
    this.s3Fakes = {
      listObjectsV2: sandbox.stub()
    };
    this.s3Stub.returns(this.s3Fakes);
  }

  setListObjectsV2ToSucceed() {
    this.s3Fakes.listObjectsV2.callsFake((parameters, callback) => {
      callback(null, S3Stub.listObjectsV2Response);
    });
  }

  setListObjectsV2ToSucceedWithNextContinuationToken() {
    this.s3Fakes.listObjectsV2.onCall(0).callsFake((parameters, callback) => {
      callback(null, S3Stub.listObjectsV2ResponseWithNextContinuationToken);
    });
    this.s3Fakes.listObjectsV2.onCall(1).callsFake((parameters, callback) => {
      callback(null, S3Stub.listObjectsV2Response);
    });
  }

  setListObjectsV2ToFail() {
    this.s3Fakes.listObjectsV2.onCall(0).callsFake((parameters, callback) => {
      callback(new Error(S3Stub.listObjectsV2ErrorMessage));
    });
  }

  get listObjectsV2Stub() {
    return this.s3Fakes.listObjectsV2;
  }

  listObjectsV2CallArgs(call = 0) {
    return this.s3Fakes.listObjectsV2.args[call];
  }
}
