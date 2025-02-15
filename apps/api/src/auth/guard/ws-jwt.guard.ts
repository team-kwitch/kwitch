import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { WsException } from "@nestjs/websockets"

@Injectable()
export class WsJwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const socket = context.switchToWs().getClient()
    const rawToken = socket.handshake.auth.accessToken as string

    if (!rawToken || rawToken.split(" ")[0] != "Bearer") {
      throw new WsException("not authenticated")
    }

    try {
      const token = rawToken.split(" ")[1]
      const payload = this.jwtService.verify(token, { secret: "secret" })
      context.switchToHttp().getRequest().user = payload
      return true
    } catch (err: unknown) {
      throw new WsException("not authenticated")
    }
  }
}
