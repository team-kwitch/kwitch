import * as mediasoup from "mediasoup"
import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
} from "@nestjs/common"
import { type ConfigType } from "@nestjs/config"
import { mediasoupConfigs } from "src/config/mediasoup.config"

@Injectable()
export class WorkerService implements OnModuleInit {
  private readonly logger = new Logger(WorkerService.name)

  private nextMediasoupWorkerIdx = 0
  private readonly mediasoupWorkers: mediasoup.types.Worker[] = []

  constructor(
    @Inject(mediasoupConfigs.KEY)
    private readonly configs: ConfigType<typeof mediasoupConfigs>,
  ) {}

  onModuleInit() {
    this.createWorker()
  }

  async createWorker() {
    for (let i = 0; i < this.configs.numWorkers; i++) {
      const worker = await mediasoup.createWorker(
        this.configs.workerSettings as mediasoup.types.WorkerSettings,
      )

      worker.on("died", () => {
        console.error(
          "mediasoup Worker died, exiting  in 2 seconds... [pid:%d]",
          worker.pid,
        )

        setTimeout(() => process.exit(1), 2000)
      })

      this.mediasoupWorkers.push(worker)

      const webRtcServerOptions = structuredClone(
        this.configs.webRtcServerOptions,
      )
      const portIncrement = this.mediasoupWorkers.length - 1

      for (const listenInfo of webRtcServerOptions.listenInfos) {
        if (listenInfo.port) {
          listenInfo.port += portIncrement
        }
      }

      const webRtcServer = await worker.createWebRtcServer(
        webRtcServerOptions as mediasoup.types.WebRtcServerOptions,
      )
      worker.appData.webRtcServer = webRtcServer

      this.logger.log(
        `mediasoup Worker created and listening in port ${webRtcServerOptions.listenInfos[0]?.port} [pid:${worker.pid}]`,
      )
    }
  }

  getWorker(): mediasoup.types.Worker {
    const worker = this.mediasoupWorkers[this.nextMediasoupWorkerIdx]

    if (!worker) {
      this.logger.error("No mediasoup workers available")
      throw new HttpException(
        "No mediasoup workers available",
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }

    if (++this.nextMediasoupWorkerIdx === this.mediasoupWorkers.length) {
      this.nextMediasoupWorkerIdx = 0
    }

    return worker
  }
}
