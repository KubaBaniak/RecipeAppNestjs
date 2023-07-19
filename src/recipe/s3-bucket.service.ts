import { ForbiddenException, Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class S3Service {
  AWS_S3_BUCKET = process.env.AWS_S3_BUCKET;
  REGION = 'eu-north-1';
  client = new S3Client({
    region: this.REGION,
    credentials: {
      accessKeyId: process.env.AWS_S3_ACCESS_KEY,
      secretAccessKey: process.env.AWS_S3_KEY_SECRET,
    },
  });

  prepareKey(userId: number, recipeId: number): string {
    return `userId-${userId}/recipeId-${recipeId}/${Date.now().toString()}`;
  }

  async uploadFile(
    file: Express.Multer.File,
    userId: number,
    recipeId: number,
  ) {
    const key = this.prepareKey(userId, recipeId);
    await this.s3_upload(this.AWS_S3_BUCKET, file.buffer, file.mimetype, key);
    return key;
  }

  async s3_upload(bucket: string, file: Buffer, mimetype: string, key: string) {
    const params = {
      Bucket: bucket,
      Key: key,
      Body: file,
      ACL: 'public-read',
      ContentType: mimetype,
    };
    const command = new PutObjectCommand(params);
    try {
      await this.client.send(command);
    } catch {
      throw new ForbiddenException('Could not send image(s) to storage.');
    }
  }
}
