import { Body, Controller, Get, Post } from '@nestjs/common';
import { ConfigService } from './config.service';
import { SaveModelConfigDto } from './dto/config.dto';

@Controller('config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Post('model')
  saveModel(@Body() dto: SaveModelConfigDto) {
    return this.configService.saveModelConfig(dto);
  }

  @Get('model')
  getModel() {
    return this.configService.getModelConfig();
  }
}
