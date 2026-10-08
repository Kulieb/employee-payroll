import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '../../generated/prisma/client.js';

type ProblemDetails = {
  type: string;
  title: string;
  status: number;
  detail: string;
};

const TITLES: Record<number, string> = {
  [HttpStatus.BAD_REQUEST]: 'Bad Request',
  [HttpStatus.UNAUTHORIZED]: 'Unauthorized',
  [HttpStatus.FORBIDDEN]: 'Forbidden',
  [HttpStatus.NOT_FOUND]: 'Not Found',
  [HttpStatus.CONFLICT]: 'Conflict',
  [HttpStatus.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
  [HttpStatus.SERVICE_UNAVAILABLE]: 'Service Unavailable',
};

@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  private readonly logger = new Logger(ProblemDetailsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const problem = this.toProblem(exception);

    if (problem.status >= 500) {
      this.logger.error(exception);
    }

    response
      .status(problem.status)
      .type('application/problem+json')
      .json(problem);
  }

  private toProblem(exception: unknown): ProblemDetails {
    if (
      exception instanceof Prisma.PrismaClientKnownRequestError &&
      exception.code === 'P2002'
    ) {
      return this.problem(HttpStatus.CONFLICT, 'Email already exists');
    }

    if (exception instanceof HttpException) {
      return this.problem(exception.getStatus(), this.detail(exception));
    }

    return this.problem(
      HttpStatus.INTERNAL_SERVER_ERROR,
      'Internal server error',
    );
  }

  private detail(exception: HttpException): string {
    const body = exception.getResponse();
    if (typeof body === 'string') {
      return body;
    }

    if (typeof body === 'object' && body && 'message' in body) {
      const message = (body as { message: string | string[] }).message;
      return Array.isArray(message) ? message.join('; ') : message;
    }

    return exception.message;
  }

  private problem(status: number, detail: string): ProblemDetails {
    return {
      type: 'about:blank',
      title: TITLES[status] ?? 'Error',
      status,
      detail,
    };
  }
}
