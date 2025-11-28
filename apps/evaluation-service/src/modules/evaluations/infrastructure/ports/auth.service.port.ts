import { Role } from '@app/common/generated/auth';

export abstract class AuthServicePort {
    abstract getRoles(): Promise<Role[]>;
}
