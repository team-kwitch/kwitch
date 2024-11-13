import { Channel } from "@kwitch/domain"
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm"

@Entity("channels")
export class ChannelEntity implements Channel {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column("varchar")
  name: string

  @Column("varchar", { nullable: true })
  description: string | null

  @Column("varchar", { nullable: true })
  imageUrl: string | null
}
