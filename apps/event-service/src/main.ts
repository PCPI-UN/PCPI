import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import * as fs from 'fs';
import { AppModule } from './app.module';

async function bootstrap() {
  // 🔹 1. Determinar ruta del proto
  const protoPath = join(__dirname, '../../../libs/common/src/protos/event.proto');

  // 🔹 2. Debugging: verificar existencia y contenido del proto
  console.log('---------------------------------------------');
  console.log('🧠 [DEBUG] gRPC service startup');
  console.log('📄 Proto path being loaded:', protoPath);
  console.log('📂 Exists?:', fs.existsSync(protoPath));

  if (fs.existsSync(protoPath)) {
    const protoContent = fs.readFileSync(protoPath, 'utf8');
    const hasEventService = /service\s+EventService/.test(protoContent);
    const hasListCourses = /rpc\s+ListCourses\s*\(/.test(protoContent);
    const hasCreateCourse = /rpc\s+CreateCourse\s*\(/.test(protoContent);
    const hasUpdateCourse = /rpc\s+UpdateCourse\s*\(/.test(protoContent);

    console.log('🔍 Contains EventService?', hasEventService);
    console.log('🔍 Contains CreateCourse?', hasCreateCourse);
    console.log('🔍 Contains ListCourses?', hasListCourses);
    console.log('🔍 Contains UpdateCourse?', hasUpdateCourse);
    console.log('---------------------------------------------');

  } else {
    console.warn('⚠️  [WARN] Proto file not found. Check protoPath above.');
  }

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'event', // Debe coincidir con "package event;" del proto
        protoPath,
        url: `${process.env.GRPC_HOST || '0.0.0.0'}:${
          process.env.GRPC_PORT || 50053
        }`,
      },
    },
  );

  // 🔹 4. Registrar eventos de inicio
  app.listen().then(() => {
    console.log('🚀 gRPC Microservice starting...');
    console.log('Transport:', Transport.GRPC);
    console.log('Package:', 'event');
    console.log('Proto Path:', protoPath);
    console.log('URL:', process.env.GRPC_PORT || 50053);
    console.log('---------------------------------------------');

  });
}

bootstrap();
