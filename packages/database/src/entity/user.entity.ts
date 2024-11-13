import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  OneToOne,
  Relation,
} from "typeorm"
import { User } from "@kwitch/domain"
import { ChannelEntity } from "./channel.entity.js"

@Entity("users")
export class UserEntity implements User {
  @PrimaryGeneratedColumn()
  id: number

  @Column("varchar")
  username: string

  @Column("varchar")
  password: string

  @OneToOne(() => ChannelEntity, { cascade: true })
  @JoinColumn()
  channel: Relation<ChannelEntity>
}
