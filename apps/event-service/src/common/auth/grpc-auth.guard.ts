import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ClientGrpc, RpcException } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { AuthServiceClient } from '@app/common/generated/auth';

@Injectable()
export class GrpcAuthGuard implements CanActivate {
  private authClient: AuthServiceClient;

  constructor(@Inject('AUTH_PACKAGE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.authClient = this.client.getService<AuthServiceClient>('AuthService');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
  const args = context.getArgs();
  const metadata = args?.[1]; // El segundo argumento del método gRPC es Metadata


  // Si no hay metadata, error inmediato
  if (!metadata) {
    throw new RpcException('No metadata found in gRPC context');
  }

  // 🔍 Intenta obtener la cabecera de forma más tolerante
  let authHeader: string | undefined;
  try {
    authHeader =
      metadata.get('Authorization')?.[0] ||
      metadata.get('authorization')?.[0];
  } catch {
    // get() puede fallar si metadata no es del tipo correcto
    const map = metadata.getMap?.();
    authHeader = map?.authorization || map?.Authorization;
  }

  if (!authHeader) {
    // 🚨 Opcional para depurar: muestra lo que realmente llega
    console.log('Metadata recibido:', metadata.getMap?.());
    throw new RpcException('Missing Authorization metadata');
  }

  const token = authHeader.replace('Bearer ', '').trim();
  const result = await lastValueFrom(this.authClient.validateJwt({ token }));

  if (!result.valid) throw new RpcException('Invalid token');

  // ✅ Añadir el userId al request
  const data = context.switchToRpc().getData();
data.userId = result.userId; // 👈 importante: modificar el payload, no el contexto separado


  return true;
}

}
