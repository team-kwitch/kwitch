import { Controller, Get, Param, ParseIntPipe, UseGuards } from "@nestjs/common"
import { UserService } from "./user.service"
import { JwtAuthGuard } from "src/auth/guard/jwt.guard"
import { APIResponse, Principal, User } from "@kwitch/types"
import { CurrentPrincipal } from "src/auth/decorator/current-user.decorator"

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(":id")
  async profile(@Param("id", ParseIntPipe) id: number) {
    const user = await this.userService.findById(id)
    return {
      success: true,
      content: user,
    }
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  async myProfile(@CurrentPrincipal() principal: Principal) {
    const user = await this.userService.findById(principal.sub)
    return {
      success: true,
      content: user,
    }
  }
}
