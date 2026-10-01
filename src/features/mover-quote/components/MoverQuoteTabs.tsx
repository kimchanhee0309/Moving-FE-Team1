/**
 * 기사님 내 견적 관리의 보낸 견적/반려 요청 탭을 렌더링함
 *
 * 공통 Tabs가 링크 이동과 선택 상새 접근성을 담당하고,
 * 이 컴포넌트는 기사님 견적 도메인의 탭 구성만 제공
 */

import { useTranslations } from "next-intl";

import { Tabs, type TabItem } from "@/common/components/Tabs/Tabs";
import { ROUTES } from "@/common/constants/routes";

type MoverQuoteTabValue = "sent" | "rejected";

interface MoverQuoteTabsProps {
  /** 현재 페이지에 해당하는 활성 탭 */
  value: MoverQuoteTabValue;
}

export function MoverQuoteTabs({ value }: MoverQuoteTabsProps) {
  const t = useTranslations("MoverQuote");
  const items: TabItem<MoverQuoteTabValue>[] = [
    {
      id: "sent",
      label: t("sentTab"),
      href: ROUTES.MOVER.QUOTE.LIST,
    },
    {
      id: "rejected",
      label: t("rejectedTab"),
      href: ROUTES.MOVER.QUOTE.REJECTED_REQUESTS,
    },
  ];

  return <Tabs ariaLabel={t("tabs")} items={items} value={value} />;
}
