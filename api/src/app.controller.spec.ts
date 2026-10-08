import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from './infrastructure/prisma/prisma.service';

jest.mock('./infrastructure/prisma/prisma.service', () => ({
  PrismaService: class {},
}));

describe('AppController', () => {
  let appController: AppController;
  const queryRaw = jest.fn();

  beforeEach(async () => {
    queryRaw.mockReset();
    queryRaw.mockResolvedValue([{ result: 1 }]);
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        { provide: PrismaService, useValue: { $queryRaw: queryRaw } },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });

  it('reports ready after a successful database query', async () => {
    await expect(appController.getHealth()).resolves.toEqual({
      status: 'ok',
      database: 'up',
    });
    expect(queryRaw).toHaveBeenCalledTimes(1);
  });

  it('returns a 503 exception without exposing database error details', async () => {
    queryRaw.mockRejectedValue(new Error('Private database details'));
    const result = await appController
      .getHealth()
      .catch((error: unknown) => error);
    expect(result).toBeInstanceOf(ServiceUnavailableException);
    expect((result as ServiceUnavailableException).getStatus()).toBe(503);
    expect((result as ServiceUnavailableException).message).toBe(
      'Database is unavailable',
    );
  });
});
