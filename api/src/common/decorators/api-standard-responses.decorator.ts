import { HttpStatus, Type } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

type ProblemResponseOptions = {
  description?: string;
  exampleMessage?: string;
};

const problemResponse = (
  status: number,
  title: string,
  options?: ProblemResponseOptions,
) =>
  ApiResponse({
    status,
    description: options?.description ?? title,
    content: {
      'application/problem+json': {
        schema: {
          type: 'object',
          properties: {
            type: { type: 'string', example: 'about:blank' },
            title: { type: 'string', example: title },
            status: { type: 'number', example: status },
            detail: {
              type: 'string',
              example: options?.exampleMessage ?? title,
            },
          },
        },
      },
    },
  });

export const ApiStandardResponse = <TModel extends Type<unknown>>(
  model: TModel,
  options?: {
    status?: number;
    description?: string;
    isArray?: boolean;
  },
) =>
  ApiResponse({
    status: options?.status ?? HttpStatus.OK,
    description: options?.description ?? 'Successful operation',
    type: model,
    isArray: options?.isArray,
  });

export const ApiBadRequest = (options?: ProblemResponseOptions) =>
  problemResponse(HttpStatus.BAD_REQUEST, 'Bad Request', options);

export const ApiUnauthorized = (options?: ProblemResponseOptions) =>
  problemResponse(HttpStatus.UNAUTHORIZED, 'Unauthorized', options);

export const ApiForbidden = (options?: ProblemResponseOptions) =>
  problemResponse(HttpStatus.FORBIDDEN, 'Forbidden', options);

export const ApiNotFound = (options?: ProblemResponseOptions) =>
  problemResponse(HttpStatus.NOT_FOUND, 'Not Found', options);

export const ApiConflict = (options?: ProblemResponseOptions) =>
  problemResponse(HttpStatus.CONFLICT, 'Conflict', options);

export const ApiServiceUnavailable = (options?: ProblemResponseOptions) =>
  problemResponse(
    HttpStatus.SERVICE_UNAVAILABLE,
    'Service Unavailable',
    options,
  );
