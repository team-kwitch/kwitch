export const API_ROUTES = {
  USER: {
    ME: {
      url: "/user/me",
      method: "GET",
    },
  },
  AUTH: {
    LOGIN: {
      url: "/auth/login",
      method: "POST",
    },
    REGISTER: {
      url: "/auth/register",
      method: "POST",
    },
  },
  STREAMING: {
    GETALL: {
      url: "/streaming",
      method: "GET",
    },
  },
} as const
