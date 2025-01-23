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

import { User } from "@kwitch/domain"
import { ChannelEntity } from "src/channel/entities/channel.entity"

@Entity()
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
}
