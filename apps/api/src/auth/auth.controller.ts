import { Body, Controller, Post, UseGuards, Res, Req } from "@nestjs/common"
import { AuthService } from "./auth.service"
import { RegisterDto } from "./dto/register.dto"
import { LocalAuthGuard } from "./guard/local.guard"

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
}
