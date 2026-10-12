export const authKeys = {
  all: ["auth"] as const,
  session: () => ["auth", "session"] as const,
};

export const AUTH_QUERY_KEY = authKeys.session();
