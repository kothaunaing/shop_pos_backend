import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import ImageKit from 'imagekit';

@Injectable()
export class ImagekitService {
  private imageKit: ImageKit;

  constructor(private readonly configService: ConfigService) {
    this.imageKit = new ImageKit({
      publicKey: this.configService.get('IMAGE_KIT_PUBLIC_KEY')!,
      privateKey: this.configService.get('IMAGE_KIT_PRIVATE_KEY')!,
      urlEndpoint: this.configService.get('IMAGE_KIT_URL_ENDPOINT')!,
    });
  }

  async uploadFile(file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File is required');

    const result = await this.imageKit.upload({
      file: file.buffer,
      fileName: file.originalname,
      folder: '/smart_restaurant', // Optional: specify a folder
      useUniqueFileName: true, // Optional: to avoid file name conflicts
      tags: ['smart_restaurant'], // Optional: add tags for better organization
    });

    return {
      url: result.url,
      thumbnailUrl: result.thumbnailUrl,
      fileId: result.fileId,
      name: result.name,
      size: result.size,
      type: result.fileType,
      height: result.height,
      width: result.width,
    };
  }

  /**
   * Delete an image by fileId
   */
  async deleteFile(fileId: string) {
    try {
      await this.imageKit.deleteFile(fileId);
      return {
        message: 'File deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error.message || 'Failed to delete file',
      );
    }
  }

  async getFileDetails(fileId: string) {
    try {
      const result = await this.imageKit.getFileDetails(fileId);

      return {
        url: result.url,
        thumbnailUrl: result.thumbnail,
        fileId: result.fileId,
        name: result.name,
        size: result.size,
        type: result.fileType,
        height: result.height,
        width: result.width,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error.message || 'Failed to retrieve file details',
      );
    }
  }
}
