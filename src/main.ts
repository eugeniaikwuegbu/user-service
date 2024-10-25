import { UnprocessableEntityException, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationError, useContainer } from 'class-validator';
import * as cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';
import * as morgan from 'morgan';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './interceptors/response-interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  app.useLogger(app.get(Logger));

  const config = new DocumentBuilder()
    .setTitle('Users Service')
    .setDescription('The Users Service API Documentation')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'Bearer',
      bearerFormat: 'JWT',
      description: 'Enter JWT auth token',
      in: 'header',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('users-service/docs', app, document);

  app.enableCors({
    origin: '*', // Allow all origins (not recommended for production)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Cache-Control, Connection',
  });

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  app.use(morgan('tiny'));

  app.useGlobalPipes(
    new ValidationPipe({
      validationError: {
        target: false,
      },
      whitelist: false,
      transform: true,
      exceptionFactory: (errors: ValidationError[]) => {
        return new UnprocessableEntityException(errors);
      },
    }),
  );

  app.useGlobalInterceptors(new ResponseInterceptor());

  const configService = app.get(ConfigService);
  const PORT = configService.get('PORT') || 1717;
  const nodeEnv = configService.get('NODE_ENV') || 'development';

  await app.listen(PORT, () =>
    console.info(`Application running in ${nodeEnv} mode on port ${PORT}`),
  );
}

bootstrap();
