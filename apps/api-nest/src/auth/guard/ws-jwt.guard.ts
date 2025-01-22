import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { AuthGuard } from "@nestjs/passport"
import { WsException } from "@nestjs/websockets"
import { Observable } from "rxjs"

@Injectable()
export class WsJwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const socket = context.switchToWs().getClient()
    const rawToken = socket.handshake.headers["Authorization"] as string

    if (!rawToken || rawToken.split(" ")[0]) {
      throw new WsException("not authenticated")
    }

    try {
      const token = rawToken.split(" ")[1]
      const payload = this.jwtService.verify(token, { secret: "secret" })
      console.log(payload)
      return true
    } catch (err: unknown) {
      throw new WsException("not authenticated")
    }
  }
}
