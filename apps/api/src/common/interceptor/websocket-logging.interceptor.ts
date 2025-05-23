import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from "@nestjs/common"
import { Observable, tap } from "rxjs"

@Injectable()
export class WebSocketLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(WebSocketLoggingInterceptor.name)

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const client = context.switchToWs().getClient()
    const event = context.switchToWs().getPattern()
    const data = context.switchToWs().getData()

    this.logger.log(
      `📡 WebSocket Request\nclient.id: ${client.id}\nevent: ${event}`,
    )

    return next.handle()
  }
}
