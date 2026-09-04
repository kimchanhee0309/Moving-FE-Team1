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

    // 공통 Input의 상태와 크기를 팀원이 로컬에서 확인하는 예시 페이지입니다.
    INPUT_COMPONENT_EXAMPLE: "/component-example/input",
  },

  CUSTOMER: {
    PROFILE: {
      REGISTER: "/customer-profile/register",
      EDIT: "/customer-profile/edit",
    },

    MOVE_REQUEST: "/move-request",

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

      DETAIL: (quoteId: string) => `/mover-quote/${quoteId}`,

      REJECTED_REQUESTS: "/mover-quote/rejected",
    },
  },
} as const;
