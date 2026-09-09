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

    // 프로필 등록·수정 화면에서 사용하는 선택 Chip의 상태 예시입니다.
    PROFILE_SELECTION_CHIP_EXAMPLE: "/component-example/profile-selection-chip",

    // 기사님 마이페이지의 리뷰 진행 바·카드·페이지네이션 예시입니다.
    MOVER_MYPAGE_COMPONENTS_EXAMPLE: "/component-example/mover-mypage-components",

    // 이미 활성 견적 요청이 있어 새 견적 요청이 막힌 화면(MoveRequestBlockedState)을
    // 실제 API 연동 없이 확인하는 QA 전용 경로입니다.
    MOVE_REQUEST_BLOCKED_EXAMPLE: "/component-example/move-request-blocked",
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

    BASIC_INFO_EDIT: "/mover-mypage/basic-info",

    REQUESTS: "/requests",

    QUOTE: {
      LIST: "/mover-quote",

      DETAIL: (quoteId: string) => `/mover-quote/${quoteId}`,

      REJECTED_REQUESTS: "/mover-quote/rejected",
    },
  },

  COMPONENT_EXAMPLE: {
    // 실제 API 호출 없이 공통 Button의 상태와 크기를 확인하는 검수 경로입니다.
    BUTTON: "/component-example/button",
    DROPDOWN: "/component-example/dropdown",
  },
} as const;
