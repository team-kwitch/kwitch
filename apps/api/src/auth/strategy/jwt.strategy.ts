import { Inject, Injectable } from "@nestjs/common"
import { ConfigService, type ConfigType } from "@nestjs/config"
import { PassportStrategy } from "@nestjs/passport"
import { Request } from "express"
import { ExtractJwt, Strategy } from "passport-jwt"
import { authConfigs } from "src/config/auth.config"

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(authConfigs.KEY)
    readonly configs: ConfigType<typeof authConfigs>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          let token = null
          if (request && request.cookies) {
            token = request.cookies["KWT_ACC"]
          }
          return token
        },
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configs.JWT_SECRET || "unsecured secret",
    })
  }

  async validate(payload: any) {
    return payload
  }
}
