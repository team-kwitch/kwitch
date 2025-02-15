import { Channel } from "./channel"

export interface User {
  id: number
  username: string
  password: string
  channel: Channel
}

export interface Principal {
  sub: number
  iat: string
  username: string
}
