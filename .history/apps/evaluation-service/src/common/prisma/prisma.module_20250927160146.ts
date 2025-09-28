import { Module } from '@nestjs/common';
import { PrismaService } from '@app/common';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
