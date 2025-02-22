import { Test, TestingModule } from "@nestjs/testing"
import { AuthService } from "./auth.service"
import { getRepositoryToken } from "@nestjs/typeorm"
import { JwtService } from "@nestjs/jwt"
import { UserEntity } from "src/user/entities/user.entity"
import { ChannelEntity } from "src/channel/entities/channel.entity"
import { Repository } from "typeorm"
import * as bcrypt from "bcrypt"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { authConfigs } from "src/config/auth.config"
import { User } from "@kwitch/types"

describe("AuthService", () => {
  let service: AuthService
  let userRepository: Repository<UserEntity>
  let channelRepository: Repository<ChannelEntity>
  let jwtService: JwtService

  const user: User = {
    id: 1,
    username: "test",
    password: "password",
    channel: {
      id: "test",
      message: "Welcome to test's channel",
      isOnStreaming: false,
      profileImg: null,
    },
  }

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [authConfigs],
        }),
      ],
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(UserEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(ChannelEntity),
          useClass: Repository,
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue("test-secret"),
          },
        },
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
    userRepository = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    )
    channelRepository = module.get<Repository<ChannelEntity>>(
      getRepositoryToken(ChannelEntity),
    )
    jwtService = module.get<JwtService>(JwtService)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  describe("validateUser", () => {
    it("should return user data without password if validation is successful", async () => {
      jest
        .spyOn(userRepository, "findOne")
        .mockResolvedValue(user as UserEntity)
      jest
        .spyOn(bcrypt, "compare")
        .mockImplementation(() => Promise.resolve(true))

      const result = await service.validateUser("test", "password")
      expect(result).toEqual({ ...user, password: undefined })
    })

    it("should return null if validation fails", async () => {
      jest.spyOn(userRepository, "findOne").mockResolvedValue(null)

      const result = await service.validateUser("test", "password")
      expect(result).toBeNull()
    })
  })

  describe("login", () => {
    it("should return access token", async () => {
      jest.spyOn(jwtService, "sign").mockReturnValue("token")

      const result = await service.login(user)
      expect(result).toEqual({ accessToken: "token" })
    })
  })

  describe("register", () => {
    it("should throw error if username already exists", async () => {
      const existingUser: UserEntity = {} as UserEntity
      jest.spyOn(userRepository, "findOneBy").mockResolvedValue(existingUser)

      await expect(
        service.register({ username: "test", password: "password" }),
      ).rejects.toThrow("username already exists")
    })

    it("should create new user and channel", async () => {
      jest.spyOn(userRepository, "findOneBy").mockResolvedValue(null)
      jest
        .spyOn(bcrypt, "hash")
        .mockImplementation(() => Promise.resolve("hashedPassword"))

      const newChannel: ChannelEntity = {
        id: "test",
        message: "Welcome to test's channel",
        isOnStreaming: false,
        profileImg: null,
      }
      jest.spyOn(channelRepository, "save").mockResolvedValue(newChannel)
      const newUser: UserEntity = {
        id: 1,
        username: "test",
        password: "hashedPassword",
        channel: newChannel,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      jest.spyOn(userRepository, "save").mockResolvedValue(newUser)

      const result = await service.register({
        username: "test",
        password: "password",
      })
      expect(result).toEqual(newUser)
    })
  })
})
