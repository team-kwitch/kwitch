import { Channel } from "@kwitch/domain"
import { Column, Entity, PrimaryColumn } from "typeorm"

@Entity("channels")
export class ChannelEntity implements Channel {
  @PrimaryColumn()
  id: string

  isOnStreaming: boolean = false

  @Column("varchar")
  message: string

  @Column("varchar", { nullable: true })
  profileImg: string | null
}
