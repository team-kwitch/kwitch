import axios from "axios"

import { BASE_URL } from "@/lib/env"

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
  },
})
