export interface User {
  id: number;
  username: string;
  password: string;
  channel: Channel | null;
}

export interface Channel {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  ownerId: number;
}
