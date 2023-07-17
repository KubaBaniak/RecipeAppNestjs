import { Injectable } from '@nestjs/common';
import * as AWS from '@aws-sdk/client-s3';

@Injectable()
export class S3Service {
  AWS_S3_BUCKET = process.env.AWS_S3_BUCKET;
  s3 = new AWS.S3({
    //accessKeyId: process.env.AWS_S3_ACCESS_KEY,
    //secretAccessKey: process.env.AWS_S3_KEY_SECRET,
  });

  async uploadFile(file: Express.Multer.File) {
    const { originalname } = file;

    await this.s3_upload(file, this.AWS_S3_BUCKET, originalname, file.mimetype);
  }

  async s3_upload(
    file: Express.Multer.File,
    bucket: string,
    name: string,
    mimetype: string,
  ) {
    const params = {
      Bucket: bucket,
      Key: String(name),
      Body: file,
      ACL: 'public-read',
      ContentType: mimetype,
      ContentDisposition: 'inline',
      CreateBucketConfiguration: {
        LocationConstraint: 'ap-south-1',
      },
    };
  }
}
