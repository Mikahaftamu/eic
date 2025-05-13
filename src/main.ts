import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable validation pipes with proper transformation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
    forbidNonWhitelisted: true,
  }));

  // Enable CORS
  app.enableCors();

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('EHealth Suite API')
    .setDescription('The Ethiopian Health Insurance Management System API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('corporate', 'Corporate client management')
    .addTag('insurance', 'Insurance company management')
    .addTag('providers', 'Healthcare provider management')
    .addTag('claims', 'Claims management')
    .addTag('billing', 'Billing and invoicing')
    .addTag('policy', 'Policy management')
    .addTag('medical-catalog', 'Medical catalog management')
    .addTag('fraud-detection', 'Fraud detection and prevention')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    deepScanRoutes: true
  });
  SwaggerModule.setup('api', app, document);

  // Start the server
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation is available at: http://localhost:${port}/api`);
}
bootstrap();
