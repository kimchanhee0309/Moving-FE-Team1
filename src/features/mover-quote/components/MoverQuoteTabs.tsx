/**
 * 기사님 내 견적 관리의 보낸 견적/반려 요청 탭을 렌더링함
 *
 * 공통 Tabs가 링크 이동과 선택 상새 접근성을 담당하고,
 * 이 컴포넌트는 기사님 견적 도메인의 탭 구성만 제공
 */

import { Tabs, type TabItem } from "@/common/components/Tabs/Tabs";
import { ROUTES } from "@/common/constants/routes";

type MoverQuoteTabValue = "sent" | "rejected";

interface MoverQuoteTabsProps {
  /** 현재 페이지에 해당하는 활성 탭 */
  value: MoverQuoteTabValue;
}

/** 모듈 밖에서 변경되지 않는 고정 탭 목록 */
const ITEMS: TabItem<MoverQuoteTabValue>[] = [
  {
    id: "sent",
    label: "보낸 견적 조회",
    href: ROUTES.MOVER.QUOTE.LIST,
  },
  {
    id: "rejected",
    label: "반려 요청",
    href: ROUTES.MOVER.QUOTE.REJECTED_REQUESTS,
  },
];

export function MoverQuoteTabs({ value }: MoverQuoteTabsProps) {
  return <Tabs ariaLabel="기사님 견적 관리" items={ITEMS} value={value} />;
}
