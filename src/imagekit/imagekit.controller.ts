import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ImagekitService } from './imagekit.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from 'src/auth/auth.guard';

@ApiBearerAuth()
@UseGuards(AuthGuard)
@ApiTags('ImageKit')
@Controller('imagekit')
export class ImagekitController {
  constructor(private readonly imagekitService: ImagekitService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a file to ImageKit' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          nullable: false,
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.imagekitService.uploadFile(file);
  }

  @Delete(':fileId')
  @ApiOperation({ summary: 'Delete a file from ImageKit' })
  @ApiParam({ name: 'fileId', description: 'ID of the file to delete' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  deleteFile(@Param('fileId') fileId: string) {
    return this.imagekitService.deleteFile(fileId);
  }

  @Get(':fileId')
  @ApiOperation({ summary: 'Get file details from ImageKit' })
  @ApiParam({ name: 'fileId', description: 'ID of the file to retrieve' })
  @ApiResponse({
    status: 200,
    description: 'File details retrieved successfully',
  })
  remove(@Param('fileId') fileId: string) {
    return this.imagekitService.getFileDetails(fileId);
  }
}
