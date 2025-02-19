import { BadRequestException, Inject, Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { UserEntity } from "src/user/entities/user.entity"
import { Repository } from "typeorm"
import * as bcrypt from "bcrypt"
import { JwtService } from "@nestjs/jwt"
import { ChannelEntity } from "src/channel/entities/channel.entity"
import { User } from "@kwitch/types"
import { ConfigService, ConfigType } from "@nestjs/config"
import { authConfigs } from "src/config/auth.config"

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(ChannelEntity)
    private readonly channelRepository: Repository<ChannelEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
    @Inject(authConfigs.KEY)
    private readonly configs: ConfigType<typeof authConfigs>,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { username },
      relations: {
        channel: true,
      },
    })

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user
      return result
    }

    return null
  }

  async login(user: User) {
    const payload = {
      sub: user.id,
      username: user.username,
      channelId: user.channel.id,
    }

    return {
      accessToken: this.jwtService.sign(payload, {
        secret: this.configs.JWT_SECRET,
      }),
    }
  }

  async register({
    username,
    password,
  }: {
    username: string
    password: string
  }): Promise<UserEntity> {
    const existingUser = await this.userRepository.findOneBy({ username })

    if (existingUser) {
      throw new BadRequestException("username already exists")
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newChannel = await this.channelRepository.save({
      id: username,
      message: `Welcome to ${username}'s channel`,
    })
    const newUser = await this.userRepository.save({
      username,
      password: hashedPassword,
      channel: newChannel,
    })

    return newUser
  }
}
