export const ROUTES = {
  HOME: "/",

  AUTH: {
    LOGIN: {
      CUSTOMER: "/login/customer",
      MOVER: "/login/mover",
    },

    SIGNUP: {
      CUSTOMER: "/signup/customer",
      MOVER: "/signup/mover",
    },
  },

  PUBLIC: {
    MOVER_SEARCH: "/mover-search",

    MOVER_DETAIL: (moverId: string) => `/mover-search/${moverId}`,
  },

  CUSTOMER: {
    PROFILE: {
      REGISTER: "/customer-profile/register",
      EDIT: "/customer-profile/edit",
    },

    MOVER_REQUEST: "move-request",

    QUOTE: {
      PENDING: "/customer-quote/pending",

      DETAIL: (quoteId: string) => `/customer-quote/${quoteId}`,

      HISTORY: "/customer-quote/history",

      HISTORY_DETAIL: (quoteId: string) => `/customer-quote/history/${quoteId}`,
    },

    FAVORITE: "/favorite",

    REVIEW: {
      CREATE: "/review/create",
      WRITTEN: "/review/written",
    },
  },

  MOVER: {
    PROFILE: {
      REGISTER: "/mover-profile/register",
      EDIT: "/mover-profile/edit",
    },

    MY_PAGE: "/mover-mypage",

    REQUESTS: "/requests",

    QUOTE: {
      LIST: "/mover-quote",

      DETAIL: (quoteId: string) => `/mover-auote/${quoteId}`,

      REJECTED_REQUESTS: "/mover-quote/rejected",
    },
  },
} as const;
