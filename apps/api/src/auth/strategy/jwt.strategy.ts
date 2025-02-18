import { Inject, Injectable } from "@nestjs/common"
import { ConfigService, ConfigType } from "@nestjs/config"
import { PassportStrategy } from "@nestjs/passport"
import { ExtractJwt, Strategy } from "passport-jwt"
import { authConfigs } from "src/config/auth.config"

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(authConfigs.KEY)
    private readonly configs: ConfigType<typeof authConfigs>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configs.JWT_SECRET,
    })
  }

  async validate(payload: any) {
    return payload
  }
}
