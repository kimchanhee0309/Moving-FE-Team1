import { Tabs, type TabItem } from "@/common/components/Tabs/Tabs";
import { ROUTES } from "@/common/constants/routes";

type MoverQuoteTabValue = "sent" | "rejected";

interface MoverQuoteTabsProps {
  value: MoverQuoteTabValue;
}

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
