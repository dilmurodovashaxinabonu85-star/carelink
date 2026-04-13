import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { CallsService } from './calls.service';
import { AiService } from './ai.service';

@ApiTags('Calls')
@Controller('calls')
export class CallsController {
  constructor(
    private readonly callsService: CallsService,
    private readonly aiService: AiService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all active calls' })
  @ApiResponse({ status: 200, description: 'List of active calls' })
  async findAll() {
    return this.callsService.findAll();
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update call status' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.callsService.updateStatus(id, body.status);
  }

  @Post('analyze')
  @ApiOperation({ summary: 'AI risk prediction for a patient' })
  @ApiResponse({ status: 200, description: 'AI risk analysis result' })
  @ApiBody({ schema: { properties: { diagnosis: { type: 'string' }, patientname: { type: 'string' } } } })
  async analyzeRisk(@Body() body: { diagnosis: string; patientname: string }) {
    return this.aiService.predictRisk({ diagnosis: body.diagnosis });
  }
}
