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

export interface Streaming {
  title: string;
  channel: Channel;
}

export interface Message {
  username: string;
  message: string;
  isAlert?: boolean;
  isBroadcaster?: boolean;
}

export interface CustomSuccessResponse {
  success: true;
  content?: any;
}

export interface CustomErrorResponse {
  success: false;
  message: string;
}

export type CustomResponse = CustomSuccessResponse | CustomErrorResponse;