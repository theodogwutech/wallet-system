import * as fs from 'fs';
import { NestApplication, NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { INestApplication, Logger } from '@nestjs/common';

declare global {
  namespace Express {
    interface User {
      id: number;
      email: string;
      firstName: string;
      lastName: string;
    }

    export interface Request {
      user?: User;
    }
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  const logger = new Logger(NestApplication.name);

  configureCors(logger, app);

  configureDocumentation(logger, app);

  await app.listen(process.env.PORT || 3000, () => {
    logger.log(`Application is running on: ${process.env.PORT || 3000}`);
  });
}

const configureCors = (logger: Logger, app: INestApplication) => {
  logger.log('Enabling cors for all origins');
  app.enableCors();
};

const configureDocumentation = (logger: Logger, app: INestApplication) => {
  logger.log('Setting up swagger documentation');

  const config = new DocumentBuilder()
    .setTitle('FintavaPay API')
    .setDescription('FintavaPay API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/', app, document);
  fs.writeFileSync('./swagger.json', JSON.stringify(document));
};
bootstrap();
