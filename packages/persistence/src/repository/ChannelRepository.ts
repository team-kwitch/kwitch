import { dataSource } from "../data-source.js"
import { ChannelEntity } from "../entity/ChannelEntity.js"

export const ChannelRepository = dataSource.getRepository(ChannelEntity)
