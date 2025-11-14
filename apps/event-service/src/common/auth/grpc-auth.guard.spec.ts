import { RpcException } from '@nestjs/microservices';
import { of } from 'rxjs';
import { GrpcAuthGuard } from './grpc-auth.guard';

describe('GrpcAuthGuard', () => {
  it('validates token, fetches permissions and attaches them to the payload', async () => {
    const mockAuthClient: any = {
      validateJwt: jest.fn().mockReturnValue(of({ valid: true, userId: 42 })),
      getUserPermissions: jest.fn().mockReturnValue(
        of({ roles: [{ id: 1, name: 'admin', scope: 'PLATFORM' }], permissions: ['read:events'] }),
      ),
    };

    // construct guard and inject mock auth client directly
    const guard = new GrpcAuthGuard({} as any);
    // bypass onModuleInit behavior
    (guard as any).authClient = mockAuthClient;

    const data: any = {};
    const metadata: any = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'authorization' || key === 'Authorization') return ['Bearer token-xyz'];
        return [];
      }),
      getMap: jest.fn().mockReturnValue({ authorization: 'Bearer token-xyz' }),
    };

    const context: any = {
      getArgs: () => [{}, metadata],
      switchToRpc: () => ({ getData: () => data }),
    };

    const result = await guard.canActivate(context as any);
    expect(result).toBe(true);
    expect(data.userId).toBe(42);
    expect(Array.isArray(data.userRoles)).toBe(true);
    expect(data.userRoles[0].name).toBe('admin');
    expect(Array.isArray(data.userPermissions)).toBe(true);
    expect(data.userPermissions).toContain('read:events');
  });

  it('throws when metadata is missing', async () => {
    const guard = new GrpcAuthGuard({} as any);
    (guard as any).authClient = {
      validateJwt: jest.fn().mockReturnValue(of({ valid: false })),
    };

    const context: any = {
      getArgs: () => [{}, undefined],
      switchToRpc: () => ({ getData: () => ({}) }),
    };

    await expect(guard.canActivate(context as any)).rejects.toThrow(RpcException);
  });

  it('falls back to token in payload when metadata is missing', async () => {
    const mockAuthClient: any = {
      validateJwt: jest.fn().mockReturnValue(of({ valid: true, userId: 7 })),
      getUserPermissions: jest.fn().mockReturnValue(of({ roles: [], permissions: ['read:events'] })),
    };

    const guard = new GrpcAuthGuard({} as any);
    (guard as any).authClient = mockAuthClient;

    const data: any = { authorization: 'Bearer fallback-token' };

    const context: any = {
      getArgs: () => [{}, undefined],
      switchToRpc: () => ({ getData: () => data }),
    };

    const result = await guard.canActivate(context as any);
    expect(result).toBe(true);
    expect(data.userId).toBe(7);
    expect(data.userPermissions).toContain('read:events');
  });
});

export {};
