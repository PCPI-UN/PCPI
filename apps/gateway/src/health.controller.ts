import { Controller, Get } from '@nestjs/common';
import { Public } from './common/decorators/public.decorator';

@Controller()
export class HealthController {
  @Public()
  @Get('health')
  getHealth() {
    return { status: 'ok' };
  }
}
