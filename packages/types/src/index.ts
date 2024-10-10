export interface User {
  id: number;
  username: string;
  password: string;
  channel: Channel;
}

export interface Channel {
  id: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  ownerId: number;
}

export interface LiveChannel {
  title: string;
  channel: {
    id: string;
    name: string;
    imageUrl?: string | null;
  };
  viewerCount: number;
}

export interface Message {
  username: string;
  message: string;
  isAlert?: boolean | null;
  isStreamer?: boolean | null;
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
