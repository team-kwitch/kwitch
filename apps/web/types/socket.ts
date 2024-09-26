
interface FailedSocketResponse {
  success: false;
  message: string;
}

interface SuccessSocketResponse {
  success: true;
  content: any;
}

export type SocketResponse = FailedSocketResponse | SuccessSocketResponse;