import { dataSource } from "../data-source.js"
import { ChannelEntity } from "../entity/channel.entity.js"

export const ChannelRepository = dataSource.getRepository(ChannelEntity)