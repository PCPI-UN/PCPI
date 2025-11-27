import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import {
    AUTH_SERVICE_NAME,
    AuthServiceClient,
    Role,
} from '@app/common/generated/auth';
import { AuthServicePort } from '../ports/auth.service.port';

@Injectable()
export class AuthServiceAdapter implements AuthServicePort, OnModuleInit {
    private authService: AuthServiceClient;

    constructor(
        @Inject(AUTH_SERVICE_NAME) private client: ClientGrpc,
    ) { }

    onModuleInit() {
        this.authService =
            this.client.getService<AuthServiceClient>(AUTH_SERVICE_NAME);
    }

    async getRoles(): Promise<Role[]> {
        const response = await lastValueFrom(
            this.authService.getRoles({})
        );
        return response.roles;
    }
}
