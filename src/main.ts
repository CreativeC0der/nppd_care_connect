import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Swagger config
  const config = new DocumentBuilder()
    .setTitle(process.env.ENVIRONMENT == 'production' ? 'Care Connect Production API' : 'Care Connect Development API')
    .setDescription('Care Connect API description')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT', // Optional: helps Swagger UI know this is a JWT
        name: 'Authorization',
        in: 'header',
      },
      'access-token', // name used later in @ApiBearerAuth()
    )
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  // Validator Setup
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strips properties not in DTO
      forbidNonWhitelisted: true, // throws error for extra properties
      transform: true, // auto-transform types
    }),
  )
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
