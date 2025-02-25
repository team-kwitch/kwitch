import { Inject, Injectable, Logger } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { Profile, Strategy } from "passport-google-oauth20"
import { authConfigs } from "src/config/auth.config"
import { ConfigType } from "@nestjs/config"

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(GoogleStrategy.name)

  constructor(
    @Inject(authConfigs.KEY)
    readonly config: ConfigType<typeof authConfigs>,
  ) {
    super({
      clientID: config.OAUTH2_GOOGLE_CLIENT_ID,
      clientSecret: config.OAUTH2_GOOGLE_CLIENT_SECRET,
      callbackURL: config.OAUTH2_GOOGLE_CALLBACK_URL,
      scope: ["email", "profile"],
    })
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    this.logger.debug(`accessToken: ${accessToken}`)
    this.logger.debug(`refreshToken: ${refreshToken}`)
    this.logger.debug(`profile: ${JSON.stringify(profile, null, 2)}`)
    return profile
  }
}
