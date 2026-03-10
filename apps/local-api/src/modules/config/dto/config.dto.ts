import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';

export class SaveModelConfigDto {
  @IsOptional()
  @IsIn(['deepseek'])
  provider?: 'deepseek';

  @IsString()
  apiKey!: string;

  @IsString()
  model!: string;

  @IsOptional()
  @IsString()
  baseUrl?: string;

  @IsOptional()
  @IsBoolean()
  testConnection?: boolean;
}
