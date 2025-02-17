import { createParamDecorator, ExecutionContext } from "@nestjs/common"

export const CurrentPrincipal = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const httpRequest = ctx.switchToHttp().getRequest()
    const wsRequest = ctx.switchToWs().getClient().request
    return httpRequest.user || wsRequest.principal
  },
)
