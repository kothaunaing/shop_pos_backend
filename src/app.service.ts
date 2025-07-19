import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}

  getStatus(): string {
    const PORT = this.configService.get('PORT');
    return `Smart Restaurant Server is running at http://localhost:${PORT}`;
  }
}
