export const API_ROUTES = {
  USER: {
    ME: {
      uri: "/user/me",
      method: "GET",
    },
  },
  AUTH: {
    LOGIN: {
      uri: "/auth/login",
      method: "POST",
    },
    REGISTER: {
      uri: "/auth/register",
      method: "POST",
    },
    LOGOUT: {
      uri: "/auth/logout",
      method: "POST",
    },
  },
  STREAMING: {
    GETALL: {
      uri: "/streaming",
      method: "GET",
    },
  },
} as const
