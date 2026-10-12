import { useTranslations } from "next-intl";

// 백엔드(src/common/constants/withdrawn-account.ts)가 탈퇴 계정의 이름·닉네임 자리에 내려 주는 고정 문구입니다.
// 탈퇴 여부를 알려 주는 별도 필드가 없어 이 값과 정확히 일치할 때만 탈퇴 계정으로 판정합니다.
const WITHDRAWN_CUSTOMER_NAME = "탈퇴한 회원";
const WITHDRAWN_MOVER_NAME = "탈퇴한 기사님";

/** 서버가 내려 준 고객 이름이 탈퇴 계정 고정 문구인지 확인합니다. */
export function isWithdrawnCustomerName(name: string): boolean {
  return name === WITHDRAWN_CUSTOMER_NAME;
}

/** 서버가 내려 준 기사님 닉네임이 탈퇴 계정 고정 문구인지 확인합니다. */
export function isWithdrawnMoverName(name: string): boolean {
  return name === WITHDRAWN_MOVER_NAME;
}

interface WithdrawnAccountNameFormatter {
  /** 호칭 없이 이름만 보여 주는 자리용입니다. 탈퇴 계정 문구만 현재 언어로 바꾸고 그 외 이름은 그대로 돌려줍니다. */
  toDisplayName: (name: string) => string;
  /** 화면에 보이는 기사님 이름입니다. */
  formatMoverName: (name: string) => string;
  /** 화면에 보이는 고객 이름입니다. */
  formatCustomerName: (name: string) => string;
  /** 기사님 프로필 이미지의 대체 텍스트입니다. */
  formatMoverProfileAlt: (name: string) => string;
}

/**
 * 탈퇴한 회원·기사님의 이름 자리에 서버가 내려 주는 한국어 고정 문구를 현재 언어로 바꿔 표시합니다.
 * 탈퇴 문구에는 이미 "기사님"·"회원"이 들어 있어 "{name} 기사님" 같은 문장에 끼워 넣으면 호칭이 겹치므로,
 * 탈퇴 계정은 호칭을 덧붙이는 번역 대신 탈퇴 계정 전용 번역을 사용합니다.
 * 한 화면에서만 쓰는 문장은 isWithdrawnMoverName·isWithdrawnCustomerName으로 호출부가 전용 번역 키를 고릅니다.
 * 실제 사용자가 입력한 이름·닉네임은 번역하지 않으며, 탈퇴 여부 판정 외의 권한·이동 제어는 담당하지 않습니다.
 */
export function useWithdrawnAccountName(): WithdrawnAccountNameFormatter {
  const common = useTranslations("Common");
  const quote = useTranslations("Quote");

  return {
    toDisplayName: (name) => {
      if (isWithdrawnCustomerName(name)) return common("withdrawnCustomer");
      if (isWithdrawnMoverName(name)) return common("withdrawnMover");
      return name;
    },
    formatMoverName: (name) =>
      isWithdrawnMoverName(name) ? common("withdrawnMover") : quote("moverName", { name }),
    formatCustomerName: (name) =>
      isWithdrawnCustomerName(name)
        ? common("withdrawnCustomer")
        : quote("customerName", { name }),
    formatMoverProfileAlt: (name) =>
      isWithdrawnMoverName(name)
        ? quote("withdrawnMoverProfile")
        : quote("moverProfile", { name }),
  };
}
