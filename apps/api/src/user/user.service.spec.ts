import { Test, TestingModule } from "@nestjs/testing"
import { UserService } from "./user.service"
import { getRepositoryToken } from "@nestjs/typeorm"
import { UserEntity } from "./entities/user.entity"
import { Repository } from "typeorm"
import { User } from "@kwitch/types"
import { NotFoundException } from "@nestjs/common"

describe("UserService", () => {
  let service: UserService
  let repository: Repository<UserEntity>

  const user: User = {
    id: 1,
    username: "test",
    password: "password",
    channel: {
      id: "test",
      message: "Welcome to test's channel",
      profileImg: null,
    },
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(UserEntity),
          useClass: Repository,
        },
      ],
    }).compile()

    service = module.get<UserService>(UserService)
    repository = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    )
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  describe("findById", () => {
    it("should return a user by id", async () => {
      const userEntity = UserEntity.from(user)
      jest.spyOn(repository, "findOne").mockResolvedValue(userEntity)

      const { password, ...expectedUser } = userEntity

      const result = await service.findById(user.id)
      expect(result).toEqual(expectedUser)
    })

    it("should throw NotFoundException if user not found", async () => {
      jest.spyOn(repository, "findOne").mockResolvedValue(null)

      await expect(service.findById(user.id)).rejects.toThrow(NotFoundException)
    })
  })
})
