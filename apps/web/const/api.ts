export const API_ROUTES = {
  USER: {
    ME: {
      url: "/api/user/me",
      method: "GET",
    },
  },
  AUTH: {
    LOGIN: {
      url: "/api/auth/login",
      method: "POST",
    },
    REGISTER: {
      url: "/api/auth/register",
      method: "POST",
    },
  },
  STREAMING: {
    GETALL: {
      url: "/api/streaming",
      method: "GET",
    },
  },
} as const
