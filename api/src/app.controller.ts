import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ApiServiceUnavailable } from './common/decorators/api-standard-responses.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({
    summary: 'Check API and database readiness; no login required',
  })
  @ApiOkResponse({
    description: 'The API can query the database',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        database: { type: 'string', example: 'up' },
      },
    },
  })
  @ApiServiceUnavailable({ exampleMessage: 'Database is unavailable' })
  getHealth(): Promise<{ status: 'ok'; database: 'up' }> {
    return this.appService.getHealth();
  }
}
