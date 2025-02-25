import { Column, Entity, PrimaryColumn } from "typeorm"

@Entity("channels")
export class ChannelEntity {
  @PrimaryColumn()
  id: string

  @Column("varchar")
  message: string

  @Column("varchar", { nullable: true })
  profileImg: string | null
}
