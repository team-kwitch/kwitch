import { Channel } from "@kwitch/types"
import { Column, Entity, PrimaryColumn } from "typeorm"

@Entity("channels")
export class ChannelEntity implements Channel {
  @PrimaryColumn()
  id: string

  @Column("varchar")
  message: string

  @Column("varchar", { nullable: true })
  profileImg: string | null

  static from(channel: Channel): ChannelEntity {
    return {
      id: channel.id,
      message: channel.message,
      profileImg: channel.profileImg,
    }
  }
}
