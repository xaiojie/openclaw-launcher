import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import { SendChatDto } from './dto/chat.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('send')
  send(@Body() dto: SendChatDto) {
    return this.chatService.send(dto);
  }

  @Get('conversations')
  conversations() {
    return this.chatService.listConversations();
  }

  @Get('conversations/:id/messages')
  messages(@Param('id') id: string) {
    return this.chatService.listMessages(id);
  }
}
