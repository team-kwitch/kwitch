export interface CustomSuccessResponse {
  success: true
  content?: any
}

export interface CustomErrorResponse {
  success: false
  error: string
}

export type CustomResponse = CustomSuccessResponse | CustomErrorResponse
