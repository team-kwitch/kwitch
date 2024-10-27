export const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL

export const API_URL =
  BASE_URL ? BASE_URL : 'http://localhost:8000'

export const SOCKET_URL =
  BASE_URL ? BASE_URL : 'http://localhost:8001'