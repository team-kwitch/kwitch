import mediasoup from "mediasoup"
import { mediasoupConfigs } from "../libs/mediasoup.js"

console.info(`running ${mediasoupConfigs.numWorkers} mediasoup Workers...`)

let nextMediasoupWorkerIdx = 0
const mediasoupWorkers: mediasoup.types.Worker[] = []

export const initWorkers = async (): Promise<void> => {
  for (let i = 0; i < mediasoupConfigs.numWorkers; i++) {
    const worker = await mediasoup.createWorker(
      mediasoupConfigs.workerSettings as mediasoup.types.WorkerSettings,
    )

    worker.on("died", () => {
      console.error(
        "mediasoup Worker died, exiting  in 2 seconds... [pid:%d]",
        worker.pid,
      )

      setTimeout(() => process.exit(1), 2000)
    })

    mediasoupWorkers.push(worker)

    const webRtcServerOptions = structuredClone(
      mediasoupConfigs.webRtcServerOptions,
    )
    const portIncrement = mediasoupWorkers.length - 1

    for (const listenInfo of webRtcServerOptions.listenInfos) {
      listenInfo.port += portIncrement
    }

    const webRtcServer = await worker.createWebRtcServer(
      webRtcServerOptions as mediasoup.types.WebRtcServerOptions,
    )
    worker.appData.webRtcServer = webRtcServer

    console.log(
      "mediasoup Worker created and listening in port %d [pid:%d]",
      webRtcServerOptions.listenInfos[0].port,
      worker.pid,
    )
  }
}

export const getWorker = (): mediasoup.types.Worker => {
  const worker = mediasoupWorkers[nextMediasoupWorkerIdx]

  if (++nextMediasoupWorkerIdx === mediasoupWorkers.length) {
    nextMediasoupWorkerIdx = 0
  }

  return worker
}
