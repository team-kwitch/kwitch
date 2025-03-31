import { Controller, Get, UseGuards } from "@nestjs/common"
import type { APIResponse, Principal, User } from "@kwitch/types"

import { UserService } from "./user.service"
import { JwtAuthGuard } from "src/auth/guard/jwt.guard"
import { CurrentPrincipal } from "src/auth/decorator/current-user.decorator"

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("me")
  @UseGuards(JwtAuthGuard)
  async myProfile(
    @CurrentPrincipal() principal: Principal,
  ): Promise<APIResponse<Omit<User, "password">>> {
    const { password, ...user } = await this.userService.findById(principal.sub)
    return {
      success: true,
      content: user,
    }
  }
}
