import { Test, TestingModule } from "@nestjs/testing"
import { MediasoupStreamingService } from "./mediasoup-streaming.service"

describe("MediasoupStreamingService", () => {
  let service: MediasoupStreamingService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MediasoupStreamingService],
    }).compile()

    service = module.get<MediasoupStreamingService>(MediasoupStreamingService)
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })
})
