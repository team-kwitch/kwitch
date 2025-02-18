import { Module } from "@nestjs/common"
import { AuthService } from "./auth.service"
import { AuthController } from "./auth.controller"
import { TypeOrmModule } from "@nestjs/typeorm"
import { UserEntity } from "src/user/entities/user.entity"
import { PassportModule } from "@nestjs/passport"
import { JwtModule, JwtService } from "@nestjs/jwt"
import { LocalStrategy } from "./strategy/local.strategy"
import { JwtStrategy } from "./strategy/jwt.strategy"
import { ChannelEntity } from "src/channel/entities/channel.entity"
import { ConfigModule } from "@nestjs/config"

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, ChannelEntity]),
    PassportModule,
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [JwtModule, JwtStrategy],
})
export class AuthModule {}
