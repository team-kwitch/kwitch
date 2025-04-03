import {
  Body,
  Controller,
  Post,
  UseGuards,
  Res,
  Req,
  Get,
  Redirect,
  Inject,
} from "@nestjs/common"
import { AuthService } from "./auth.service"
import { RegisterDto } from "./dto/register.dto"
import { LocalAuthGuard } from "./guard/local.guard"
import { GoogleAuthGuard } from "./guard/google.guard"
import { Profile } from "passport-google-oauth20"
import { appConfigs } from "src/config/app.config"
import { ConfigType } from "@nestjs/config"
import { Request, Response } from "express"
import { User } from "@kwitch/types"

@Controller("auth")
export class AuthController {
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
      content: {
        user,
      },
    }
  }

  @UseGuards(LocalAuthGuard)
  @Post("login")
  async login(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    if (!req.user) {
      return {
        success: false,
        content: {
          message: "Invalid credentials",
        },
      }
    }

    const requestUser = req.user as User

    const { accessToken, user } = await this.authService.login(requestUser)
    const { password, ...userWithoutPassword } = user

    this.createCookie(res, accessToken)

    return {
      success: true,
      content: {
        accessToken,
        user: userWithoutPassword,
      },
    }
  }

  @Post("logout")
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie("KWT_ACC")
    return {
      success: true,
    }
  }

  @UseGuards(GoogleAuthGuard)
  @Get("google")
  googleAuth() {}

  @UseGuards(GoogleAuthGuard)
  @Get("google/callback")
  @Redirect()
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const profile = req.user as Profile

    const { accessToken } = await this.authService.processGoogleLogin(profile)

    this.createCookie(res, accessToken)

    return {
      url: this.config.CORS_ORIGIN,
    }
  }

  private createCookie(res: Response, accessToken: string) {
    res.cookie("KWT_ACC", accessToken, {
      httpOnly: true,
      secure: this.config.NODE_ENV === "production",
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      domain: this.config.ACCESS_TOKEN_COOKIE_DOMAIN,
      sameSite: "strict",
    })
  }
}
