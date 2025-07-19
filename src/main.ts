import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import { ValidationPipe } from '@nestjs/common';

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
  // app.useWebSocketAdapter(new IoAdapter());
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Shop POS')
    .setDescription('Shop POS API Documentation')
    .setVersion('0.0.1')
    .addBearerAuth()
    .addServer(
      process.env.NODE_ENV === 'production'
        ? 'https://smartrestaurantapi.onrender.com'
        : `http://localhost:${PORT}`,
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  writeFileSync('./swagger.json', JSON.stringify(document));

  await app.listen(PORT);
  console.log(
    `API Documentation is available on: http://localhost:${PORT}/api`,
  );
}
bootstrap();
