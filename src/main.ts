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

  // Get port from environment variable or use default
  const port = process.env.PORT || 10000;
  
  // Listen on all network interfaces
  await app.listen(port, '0.0.0.0');
  
  // Get the actual URL from the server
  const serverUrl = await app.getUrl();
  console.log(`Application is running on: ${serverUrl}`);
  console.log(`Swagger documentation is available at: ${serverUrl}/api`);
}
bootstrap();
