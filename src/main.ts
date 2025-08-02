import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { writeFileSync } from 'fs';
import { NextFunction, Request, Response } from 'express';

async function bootstrap() {
  const PORT = process.env.PORT ?? 5000;
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('/api');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true,
  });

  // Create Swagger config without server first
  const config = new DocumentBuilder()
    .setTitle('Shop POS')
    .setDescription('Shop POS API Documentation')
    .setVersion('0.0.1')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Dynamic server URL in Swagger (use middleware)
  app.use('/api-json', (req: Request, res: Response, next: NextFunction) => {
    const host = req.headers.host;
    const protocol = req.protocol;
    const url = `${protocol}://${host}`;

    const dynamicDoc = {
      ...document,
      servers: [{ url }],
    };

    res.json(dynamicDoc);
  });

  // Regular Swagger UI setup
  SwaggerModule.setup('api', app, document);

  writeFileSync('./swagger.json', JSON.stringify(document));

  await app.listen(PORT);
  console.log(`App running on: http://localhost:${PORT}/api`);
}
bootstrap();
