import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as AWS from 'aws-sdk';

@Controller('uploads')
export class UploadsController {
  @Post('')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file) {
    AWS.config.update({
      credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY,
        secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
      },
    });

    try {
      const objectName = `${Date.now()}_${file.originalname}`;
      await new AWS.S3()
        .putObject({
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Body: file.buffer,
          Key: objectName,
          ACL: 'public-read',
        })
        .promise();
      const url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${objectName}`;

      return { url };
    } catch (err) {
      console.log(err);
      return null;
    }
    console.log(file);
  }
}
