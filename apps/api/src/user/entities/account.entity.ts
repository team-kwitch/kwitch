import { Column, Entity, PrimaryColumn } from "typeorm"

@Entity("accounts")
export class AccountEntity {
  @PrimaryColumn({ type: "uuid" })
  id: string

  @Column({ type: "varchar" })
  sub: string

  @Column({ type: "varchar" })
  provider: string
}
