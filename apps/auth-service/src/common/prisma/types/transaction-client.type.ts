import { PrismaService } from '@common/prisma/prisma.service';
export type TransactionClient = Omit<
  PrismaService,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'
>;