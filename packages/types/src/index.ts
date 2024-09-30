export interface User {
  id: number;
  username: string;
  password: string;
}

export interface Channel {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
}
