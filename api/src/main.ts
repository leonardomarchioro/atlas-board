import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

import { HttpExceptionFilter } from "@shared/presentation/http-exception.filter";

import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const corsOrigins = (process.env.CORS_ORIGINS ?? "http://localhost:3001")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
