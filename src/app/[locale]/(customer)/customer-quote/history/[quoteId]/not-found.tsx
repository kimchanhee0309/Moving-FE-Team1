import { useTranslations } from "next-intl";

import { EmptyState } from "@/common/components/page-state";
import { ROUTES } from "@/common/constants/routes";
import { Link } from "@/i18n/navigation";

export default function HistoryQuoteNotFound() {
  const t = useTranslations("CustomerQuote");

  return (
    <EmptyState
      title={t("notFoundTitle")}
      description={t("historyNotFound")}
      action={
        <Link href={ROUTES.CUSTOMER.QUOTE.HISTORY}>{t("backToHistory")}</Link>
      }
    />
  );
}
