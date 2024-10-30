import axios from "axios"

import { SERVER_URL } from "@/utils/env"

export const api = axios.create({
  baseURL: SERVER_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
  },
})
