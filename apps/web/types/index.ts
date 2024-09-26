export interface User {
  id: number;
  username: string;
  channel: Channel;
}

export interface Channel {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
}

export interface Broadcast {
  title: string;
  channel: Channel;
}

export interface Message {
  username: string;
  message: string;
  isAlert?: boolean;
  isBroadcaster?: boolean;
}
