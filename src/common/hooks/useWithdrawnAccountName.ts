import { useTranslations } from "next-intl";

// 백엔드(src/common/constants/withdrawn-account.ts)가 탈퇴 계정의 이름·닉네임 자리에 내려 주는 고정 문구입니다.
// 탈퇴 여부를 알려 주는 별도 필드가 없어 이 값과 정확히 일치할 때만 탈퇴 계정으로 판정합니다.
const WITHDRAWN_CUSTOMER_NAME = "탈퇴한 회원";
const WITHDRAWN_MOVER_NAME = "탈퇴한 기사님";

interface WithdrawnAccountNameFormatter {
  /** 탈퇴 계정 문구만 현재 언어로 바꾸고 그 외 이름은 그대로 돌려줍니다. alt·aria-label처럼 다른 문장에 끼워 넣을 때 씁니다. */
  toDisplayName: (name: string) => string;
  /** 화면에 보이는 기사님 이름입니다. 탈퇴 계정은 호칭을 덧붙이지 않아 "탈퇴한 기사님 기사님"이 되지 않습니다. */
  formatMoverName: (name: string) => string;
  /** 화면에 보이는 고객 이름입니다. 탈퇴 계정은 호칭을 덧붙이지 않아 "탈퇴한 회원 고객님"이 되지 않습니다. */
  formatCustomerName: (name: string) => string;
}

/**
 * 탈퇴한 회원·기사님의 이름 자리에 서버가 내려 주는 한국어 고정 문구를 현재 언어로 바꿔 표시합니다.
 * 실제 사용자가 입력한 이름·닉네임은 번역하지 않으며, 탈퇴 여부 판정 외의 권한·이동 제어는 담당하지 않습니다.
 */
export function useWithdrawnAccountName(): WithdrawnAccountNameFormatter {
  const common = useTranslations("Common");
  const quote = useTranslations("Quote");

  const toDisplayName = (name: string) => {
    if (name === WITHDRAWN_CUSTOMER_NAME) return common("withdrawnCustomer");
    if (name === WITHDRAWN_MOVER_NAME) return common("withdrawnMover");
    return name;
  };

  return {
    toDisplayName,
    formatMoverName: (name) =>
      name === WITHDRAWN_MOVER_NAME ? common("withdrawnMover") : quote("moverName", { name }),
    formatCustomerName: (name) =>
      name === WITHDRAWN_CUSTOMER_NAME
        ? common("withdrawnCustomer")
        : quote("customerName", { name }),
  };
}
