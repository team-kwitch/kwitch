import { APIResponse } from "@kwitch/types"
import { API_URL } from "./env"

interface APICallOptions {
  uri: string
  method?: "GET" | "POST" | "PUT" | "DELETE"
  headers?: Record<string, string>
  body?: Record<string, any>
}

export const APICall = async <T>({
  uri,
  method = "GET",
  headers = {},
  body,
}: APICallOptions): Promise<APIResponse<T>> => {
  try {
    const res = await fetch(API_URL + uri, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      credentials: "include",
    })
    const json = await res.json()
    return json
  } catch (err: any) {
    return {
      success: false,
      message: err.message,
    }
  }
}
