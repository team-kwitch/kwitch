import { PartialType } from "@nestjs/mapped-types"
import { StartStreamingDto } from "./start-streaming.dto"

export class UpdateStreamingDto extends PartialType(StartStreamingDto) {
  channelId: string
}
