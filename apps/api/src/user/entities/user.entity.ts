import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from "typeorm"

import { User } from "@kwitch/types"
import { ChannelEntity } from "src/channel/entities/channel.entity"

@Entity("users")
export class UserEntity implements User {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: "varchar", unique: true })
  username: string

  @Column({ type: "varchar" })
  password: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @OneToOne(() => ChannelEntity, { cascade: true })
  @JoinColumn()
  channel: Relation<ChannelEntity>

  static from(user: User): UserEntity {
    return {
      id: user.id,
      username: user.username,
      password: user.password,
      createdAt: new Date(),
      updatedAt: new Date(),
      channel: ChannelEntity.from(user.channel),
    }
  }
}
