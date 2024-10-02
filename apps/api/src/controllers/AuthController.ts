import { Request, Response } from "express";
import {
  JsonController,
  Post,
  Req,
  Res,
  UseBefore,
} from "routing-controllers";
import { Service } from "typedi";

import { passport } from "@kwitch/auth";

import AuthService from "@/services/AuthService";
import { LocalAuthenticationMiddleware } from "@/middleware/auth/LocalAuthenticationMiddleware";

@Service()
@JsonController("/auth")
export class AuthController {
  private readonly authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  @Post("/sign-up")
  public async signUp(@Req() req: Request, @Res() res: Response) {
    const { username, password }: { username: string; password: string } =
      req.body;

    const createdUser = await this.authService.signUp(username, password);
    return res.json({
      success: true,
      content: { user: createdUser },
    });
  }

  @Post("/sign-in/local")
  @UseBefore(LocalAuthenticationMiddleware)
  public localSignIn(@Req() req: Request, @Res() res: Response) {}

  @Post("/sign-out")
  public signOut(@Req() req: Request, @Res() res: Response) {
    req.logOut((err) => {
      if (err) {
        return res.status(500).json({ success: false, message: err.message });
      }
      return res.json({ success: true });
    });
  }
}
