import { Module } from '@nestjs/common';
import { ImagekitService } from './imagekit.service';
import { ImagekitController } from './imagekit.controller';

@Module({
  controllers: [ImagekitController],
  providers: [ImagekitService],
  exports: [ImagekitService],
})
export class ImagekitModule {}
