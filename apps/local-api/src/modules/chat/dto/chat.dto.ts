import { IsOptional, IsString } from 'class-validator';

export class SendChatDto {
  @IsString()
  message!: string;

  @IsOptional()
  @IsString()
  conversationId?: string;
}
