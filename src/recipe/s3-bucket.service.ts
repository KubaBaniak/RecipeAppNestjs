import { ForbiddenException, Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandOutput,
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class S3Service {
  AWS_S3_BUCKET = process.env.AWS_S3_BUCKET;
  client = new S3Client({
    region: process.env.AWS_S3_REGION,
    credentials: {
      accessKeyId: process.env.AWS_S3_ACCESS_KEY,
      secretAccessKey: process.env.AWS_S3_KEY_SECRET,
    },
  });

  prepareKey(userId: number, recipeId: number): string {
    return `users/userId:${userId}/recipes/recipeId:${recipeId}/${uuidv4()}`;
  }

  async uploadFile(
    file: Express.Multer.File,
    userId: number,
    recipeId: number,
  ): Promise<string> {
    const key = this.prepareKey(userId, recipeId);
    await this.sendToS3(this.AWS_S3_BUCKET, file.buffer, file.mimetype, key);
    return key;
  }

  async sendToS3(
    bucket: string,
    file: Buffer,
    mimetype: string,
    key: string,
  ): Promise<PutObjectCommandOutput> {
    const params = {
      Bucket: bucket,
      Key: key,
      Body: file,
      ACL: 'public-read',
      ContentType: mimetype,
    };
    const command = new PutObjectCommand(params);
    try {
      return await this.client.send(command);
    } catch (e) {
      throw new ForbiddenException('Could not send image(s) to storage.');
    }
  }
}
