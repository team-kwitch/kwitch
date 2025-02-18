import * as mediasoup from "mediasoup"
import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common"
import { mediasoupConfigs } from "../../config/mediasoup.config"
import { ConfigType } from "@nestjs/config"

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
        listenInfo.port += portIncrement
      }

      const webRtcServer = await worker.createWebRtcServer(
        webRtcServerOptions as mediasoup.types.WebRtcServerOptions,
      )
      worker.appData.webRtcServer = webRtcServer

      this.logger.log(
        "mediasoup Worker created and listening in port %d [pid:%d]",
        webRtcServerOptions.listenInfos[0].port,
        worker.pid,
      )
    }
  }

  getWorker(): mediasoup.types.Worker {
    const worker = this.mediasoupWorkers[this.nextMediasoupWorkerIdx]

    if (++this.nextMediasoupWorkerIdx === this.mediasoupWorkers.length) {
      this.nextMediasoupWorkerIdx = 0
    }

    return worker
  }
}
