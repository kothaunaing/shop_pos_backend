import {
  BadRequestException,
  HttpStatus,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { AnySchema, ValidationError } from 'yup';

@Injectable()
export class YupValidationPipe implements PipeTransform {
  constructor(private schema: AnySchema) {}

  async transform(dto: any) {
    try {
      const newDto = await this.schema.validate(dto, {
        stripUnknown: true,
        abortEarly: false,
      });

      return newDto;
    } catch (error: any) {
      if (error instanceof ValidationError) {
        throw new BadRequestException({
          error: 'Validation failed',
          errors: error.errors,
          statusCode: HttpStatus.BAD_REQUEST,
        });
      }

      throw new BadRequestException('Validation failed');
    }
  }
}
