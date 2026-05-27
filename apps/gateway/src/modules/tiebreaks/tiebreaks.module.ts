import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import {
    TIE_BREAK_SERVICE_NAME,
    protobufPackage,
} from '@app/common/generated/evaluation';
import { TieBreaksService } from './tiebreaks.service';
import { TieBreaksController } from './tiebreaks.controller';

@Module({
    imports: [
        ClientsModule.registerAsync([
            {
                name: TIE_BREAK_SERVICE_NAME,
                imports: [ConfigModule],
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.GRPC,
                    options: {
                        package: protobufPackage,
                        protoPath: join(
                            process.cwd(),
                            'libs/common/src/protos/evaluation.proto',
                        ),
                        url: configService.get<string>('EVALUATION_SERVICE_URL'),
                    },
                }),
                inject: [ConfigService],
            },
        ]),
    ],
    controllers: [TieBreaksController],
    providers: [TieBreaksService],
})
export class TieBreaksModule {}
