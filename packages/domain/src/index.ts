export interface User {
  id: number;
  username: string;
  password: string;
  channel: Channel;
}

export interface Channel {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
}

export interface LiveChannel {
  title: string;
  channel: Channel;
  viewerCount: number;
}

export interface Chat {
  username: string;
  message: string;
  isAlert?: boolean;
  isStreamer?: boolean;
}

export interface CustomSuccessResponse {
  success: true;
  content?: any;
}

export interface CustomErrorResponse {
  success: false;
  error: string;
}

export type CustomResponse = CustomSuccessResponse | CustomErrorResponse;
