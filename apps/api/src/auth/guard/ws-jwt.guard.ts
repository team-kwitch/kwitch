import { CanActivate, ExecutionContext, Injectable, Type } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { WsException } from "@nestjs/websockets"

export function WsJwtAuthGuard(required: boolean = true): Type<CanActivate> {
  @Injectable()
  class MixinWsJwtAuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const socket = context.switchToWs().getClient()
      const rawToken = socket.handshake.auth.accessToken as string

      if (!rawToken || rawToken.split(" ")[0] != "Bearer") {
        if (required) {
          throw new WsException("not authenticated")
        } else {
          return true
        }
      }

      try {
        const token = rawToken.split(" ")[1]
        const payload = this.jwtService.verify(token, { secret: "secret" })
        socket.request.principal = payload // Set user information in the socket request object
        return true
      } catch (err: unknown) {
        if (required) {
          throw new WsException("not authenticated")
        } else {
          return true
        }
      }
    }
  }

  return MixinWsJwtAuthGuard
}
