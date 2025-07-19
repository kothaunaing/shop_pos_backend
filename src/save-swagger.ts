import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import { Logger } from '@nestjs/common';

async function saveSwagger() {
  const PORT = process.env.PORT ?? 3000;
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('/api');

  const config = new DocumentBuilder()
    .setTitle('Smart Restaurant')
    .setDescription('The API description')
    .setVersion('0.0.1')
    .addBearerAuth()
    .addServer(`http://localhost:${PORT}`)
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
  writeFileSync('./swagger.json', JSON.stringify(document));

  const logger = new Logger();
  logger.log('Generated swagger.json successfully');
  process.exit(0);
}
saveSwagger();
