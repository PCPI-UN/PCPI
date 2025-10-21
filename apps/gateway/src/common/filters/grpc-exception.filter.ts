import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { status as GrpcStatus } from '@grpc/grpc-js';

/*
  This file contains a mapping from gRPC status codes to HTTP status codes. The main reason for this is that the services
  throw gRPC exceptions, but we need to return HTTP status codes to the client. For this reason, the dict below contains
  the mapping that the exception filter will use to return the correct HTTP code.
*/
const grpcToHttpStatus: Record<number, HttpStatus> = {
  [GrpcStatus.OK]: HttpStatus.OK,
  [GrpcStatus.CANCELLED]: HttpStatus.INTERNAL_SERVER_ERROR,
  [GrpcStatus.UNKNOWN]: HttpStatus.INTERNAL_SERVER_ERROR,
  [GrpcStatus.INVALID_ARGUMENT]: HttpStatus.BAD_REQUEST,
  [GrpcStatus.DEADLINE_EXCEEDED]: HttpStatus.REQUEST_TIMEOUT,
  [GrpcStatus.NOT_FOUND]: HttpStatus.NOT_FOUND,
  [GrpcStatus.ALREADY_EXISTS]: HttpStatus.CONFLICT,
  [GrpcStatus.PERMISSION_DENIED]: HttpStatus.FORBIDDEN,
  [GrpcStatus.RESOURCE_EXHAUSTED]: HttpStatus.TOO_MANY_REQUESTS,
  [GrpcStatus.FAILED_PRECONDITION]: HttpStatus.BAD_REQUEST,
  [GrpcStatus.ABORTED]: HttpStatus.INTERNAL_SERVER_ERROR,
  [GrpcStatus.OUT_OF_RANGE]: HttpStatus.BAD_REQUEST,
  [GrpcStatus.UNIMPLEMENTED]: HttpStatus.NOT_IMPLEMENTED,
  [GrpcStatus.INTERNAL]: HttpStatus.INTERNAL_SERVER_ERROR,
  [GrpcStatus.UNAVAILABLE]: HttpStatus.SERVICE_UNAVAILABLE,
  [GrpcStatus.DATA_LOSS]: HttpStatus.INTERNAL_SERVER_ERROR,
  [GrpcStatus.UNAUTHENTICATED]: HttpStatus.UNAUTHORIZED,
};

@Catch()
export class GrpcExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GrpcExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // If we can't find a matching HTTP status code, default to 500 Internal Server Error
    let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    // If the exception is a gRPC error, use the mapping to find the corresponding HTTP status code
    if (typeof exception === 'object' && exception !== null && 'code' in exception) {
      const grpcCode = exception.code;
      httpStatus = grpcToHttpStatus[grpcCode] || HttpStatus.INTERNAL_SERVER_ERROR;
      message = exception.details || exception.message || 'An unexpected error occurred';
      
      this.logger.error(`gRPC Error - Code: ${grpcCode}, Message: ${message}`, exception.stack);
    } else {
      // Otherwise, use the status code and message from the exception. This is a regular NestJS exception.
      httpStatus = exception.status || HttpStatus.INTERNAL_SERVER_ERROR;
      message = exception.message || message;
      this.logger.error(`Non-gRPC Error: ${message}`, exception.stack);
    }
    
    const errorResponse = {
      statusCode: httpStatus,
      message,
      timestamp: new Date().toISOString(),
    };

    response.status(httpStatus).json(errorResponse);
  }
}
