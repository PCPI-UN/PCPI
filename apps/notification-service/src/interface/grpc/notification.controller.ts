import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  NOTIFICATION_SERVICE_NAME,
  SendEmailResponse,
} from '@app/common/generated/notification';
import { SendEmailUseCase } from '@/application/use-cases/send-email.use-case';
import { SendEmailDto } from '@/application/dto/send-email.dto';

@Controller()
export class NotificationController {
  constructor(private readonly sendEmailUseCase: SendEmailUseCase) {}

  @GrpcMethod(NOTIFICATION_SERVICE_NAME, 'SendEmail')
  sendEmail(request: SendEmailDto): Promise<SendEmailResponse> {
    return this.sendEmailUseCase.execute(request);
  }
}
