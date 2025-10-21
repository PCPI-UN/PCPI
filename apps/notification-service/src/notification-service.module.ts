import { Module } from '@nestjs/common';
import { NotificationController } from './interface/grpc/notification.controller';
import { SendEmailUseCase } from './application/use-cases/send-email.use-case';
import { ConfigModule } from '@nestjs/config';
import { EmailServicePort } from './application/ports/email.service.port';
import { EmailJsAdapter } from './infrastructure/email/emailjs.adapter';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [NotificationController],
  providers: [
    SendEmailUseCase,
    {
      provide: EmailServicePort,
      useClass: EmailJsAdapter,
    },
  ],
})
export class NotificationServiceModule {}
