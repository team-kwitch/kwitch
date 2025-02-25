import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from "typeorm"

import { User } from "@kwitch/types"
import { ChannelEntity } from "src/channel/entities/channel.entity"
import { AccountEntity } from "./account.entity"

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

  @OneToOne(() => AccountEntity, { cascade: true })
  @JoinColumn({ name: "account_id" })
  account: Relation<AccountEntity>
}
