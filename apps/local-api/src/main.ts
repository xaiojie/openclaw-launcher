import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true
    })
  );

  const prisma = app.get(PrismaService);
  await prisma.enableShutdownHooks(app);

  await app.listen(Number(process.env.LOCAL_API_PORT ?? 4100));
}

void bootstrap();
