import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ 
    transform: true,
    forbidUnknownValues: true
  }))

  app.use((req: any, res: any, next: any) => { 
    res.setTimeout(300000);
    next();
  })

  const config = new DocumentBuilder()
    .setTitle('LinkedIn Scraper API')
    .setDescription('API for scraping LinkedIn job listings')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();