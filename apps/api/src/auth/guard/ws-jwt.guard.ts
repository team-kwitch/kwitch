import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Type,
} from "@nestjs/common"
import { ConfigType } from "@nestjs/config"
import { JwtService } from "@nestjs/jwt"
import { WsException } from "@nestjs/websockets"
import { authConfigs } from "src/config/auth.config"

export function WsJwtAuthGuard(required: boolean = true): Type<CanActivate> {
  @Injectable()
  class MixinWsJwtAuthGuard implements CanActivate {
    constructor(
      private readonly jwtService: JwtService,
      @Inject(authConfigs.KEY)
      private readonly configs: ConfigType<typeof authConfigs>,
    ) {}

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
        const payload = this.jwtService.verify(token, {
          secret: this.configs.JWT_SECRET,
        })
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
