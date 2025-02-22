import { Test, TestingModule } from "@nestjs/testing"
import { MediasoupStreamingService } from "./mediasoup-streaming.service"
import { WorkerService } from "./worker.service"
import { ConfigService } from "@nestjs/config"
import { mediasoupConfigs } from "../../config/mediasoup.config"
import { WsException } from "@nestjs/websockets"
import { StartStreamingDto } from "../dto/start-streaming.dto"
import { UpdateStreamingDto } from "../dto/update-streaming.dto"
import { User } from "@kwitch/types"
import { UUID } from "typeorm/driver/mongodb/bson.typings.js"

describe("MediasoupStreamingService", () => {
  let user: User
  let socketId: string

  let service: MediasoupStreamingService
  let workerService: WorkerService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediasoupStreamingService,
        {
          provide: WorkerService,
          useValue: {
            getWorker: jest.fn().mockReturnValue({
              createRouter: jest.fn().mockResolvedValue({}),
              appData: { webRtcServer: {} },
            }),
          },
        },
        {
          provide: mediasoupConfigs.KEY,
          useValue: {},
        },
      ],
    }).compile()

    service = module.get<MediasoupStreamingService>(MediasoupStreamingService)
    workerService = module.get<WorkerService>(WorkerService)

    user = {
      id: 1,
      username: "test",
      password: "password",
      channel: {
        id: "test",
        message: "Welcome to test's channel",
        profileImg: null,
      },
    }
    socketId = `${user.channel.id}-RANDOMSOCKETID`
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  it("should start a new streaming", async () => {
    const startStreamingDto: StartStreamingDto = { title: "Test Stream" }

    const streaming = await service.start({
      startStreamingDto,
      socketId,
      streamer: user,
    })

    expect(streaming).toBeDefined()
    expect(service.findById(user.channel.id)).toBe(streaming)
  })

  it("should throw an error if streaming is already live", async () => {
    const startStreamingDto: StartStreamingDto = { title: "Test Stream" }

    await service.start({ startStreamingDto, socketId, streamer: user })

    await expect(
      service.start({ startStreamingDto, socketId, streamer: user }),
    ).rejects.toThrow(WsException)
  })

  it("should end a streaming", async () => {
    const startStreamingDto: StartStreamingDto = { title: "Test Stream" }
    const streaming = await service.start({
      startStreamingDto,
      socketId,
      streamer: user,
    })
    streaming.destroy = jest.fn()

    service.end(user.channel.id)

    expect(streaming.destroy).toHaveBeenCalled()
    expect(service.findById(user.channel.id)).toBeNull()
  })

  it("should add a viewer to a streaming", async () => {
    const startStreamingDto: StartStreamingDto = { title: "Test Stream" }
    const streaming = await service.start({
      startStreamingDto,
      socketId,
      streamer: user,
    })

    service.join({ channelId: user.channel.id, viewerSocketId: socketId })

    expect(streaming.viewerCount).toBe(1)
  })

  it("should remove a viewer from a streaming", async () => {
    const startStreamingDto: StartStreamingDto = { title: "Test Stream" }
    const streaming = await service.start({
      startStreamingDto,
      socketId,
      streamer: user,
    })
    streaming.router.close = jest.fn()

    service.join({ channelId: user.channel.id, viewerSocketId: socketId })
    service.leave({ channelId: user.channel.id, viewerSocketId: socketId })

    expect(streaming.viewerCount).toBe(0)
  })
})
