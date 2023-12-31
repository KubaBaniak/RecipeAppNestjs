import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { initalizeSwagger, rollbarConfig } from './config';
import { HttpExceptionFilter } from './http-exception.filter';
import Rollbar from 'rollbar';

export const rollbar = new Rollbar(rollbarConfig);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.enableCors();

  app.useGlobalFilters(new HttpExceptionFilter());

  const swaggerConfig = initalizeSwagger();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.APP_PORT);
}
bootstrap();
