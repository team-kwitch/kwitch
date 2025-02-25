import {
  Body,
  Controller,
  Post,
  UseGuards,
  Res,
  Req,
  Get,
  Redirect,
  Logger,
  Inject,
} from "@nestjs/common"
import { AuthService } from "./auth.service"
import { RegisterDto } from "./dto/register.dto"
import { LocalAuthGuard } from "./guard/local.guard"
import { GoogleAuthGuard } from "./guard/google.guard"
import { Profile } from "passport-google-oauth20"
import { appConfigs } from "src/config/app.config"
import { ConfigType } from "@nestjs/config"

@Controller("auth")
export class AuthController {
  private readonly logger = new Logger(AuthController.name)

  constructor(
    @Inject(appConfigs.KEY)
    private readonly config: ConfigType<typeof appConfigs>,
    private readonly authService: AuthService,
  ) {}

  @Post("register")
  async register(@Body() dto: RegisterDto) {
    const user = await this.authService.register({
      username: dto.username,
      password: dto.password,
    })
    return {
      success: true,
      content: user,
    }
  }

  @UseGuards(LocalAuthGuard)
  @Post("login")
  async login(@Req() req) {
    const { accessToken } = await this.authService.login(req.user)
    return {
      success: true,
      content: {
        accessToken,
      },
    }
  }

  @UseGuards(GoogleAuthGuard)
  @Get("google")
  googleAuth() {}

  @UseGuards(GoogleAuthGuard)
  @Get("google/callback")
  @Redirect()
  async googleAuthCallback(@Req() req) {
    const profile = req.user as Profile

    const { accessToken } = await this.authService.processGoogleLogin(profile)
    return {
      url: `${this.config.CORS_ORIGIN}/oauth2/callback?accessToken=${accessToken}`,
    }
  }
}
