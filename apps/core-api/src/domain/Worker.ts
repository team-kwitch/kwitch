import * as mediasoup from "mediasoup"

console.info("running %d mediasoup Workers...", 1)

const worker = await mediasoup.createWorker({
  logLevel: "warn",
})

worker.on("died", () => {
  console.error(
    "mediasoup Worker died, exiting  in 2 seconds... [pid:%d]",
    worker.pid,
  )

  setTimeout(() => process.exit(1), 2000)
})

setInterval(async () => {
  const usage = await worker.getResourceUsage()

  console.info(
    "mediasoup Worker resource usage [pid:%d]: %o",
    worker.pid,
    usage,
  )

  const dump = await worker.dump()
  console.info("mediasoup Worker dump [pid:%d]: %o", worker.pid, dump)
}, 120000)

export { worker }
