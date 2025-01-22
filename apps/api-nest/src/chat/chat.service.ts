import { Injectable } from "@nestjs/common"

@Injectable()
export class ChatService {
  filterMessage(message: string): string {
    return message
  }
}
