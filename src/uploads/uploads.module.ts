import { UploadsController } from './uploads.controller';
import { Module } from '@nestjs/common';

@Module({
  controllers: [UploadsController],
})
export class UploadsModule {}
