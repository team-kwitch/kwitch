export interface APISuccessResponse<T> {
  success: true
  content: T
  pagination?: {
    limit: number
    page: number
    total?: number
  }
}

export interface APIErrorResponse {
  success: false
  message: string
}

export type APIResponse<T> = APISuccessResponse<T> | APIErrorResponse
