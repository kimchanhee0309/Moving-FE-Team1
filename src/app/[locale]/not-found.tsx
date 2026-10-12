import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

import { EmptyState } from "@/common/components/page-state";
import { ROUTES } from "@/common/constants/routes";

export default function NotFound() {
  const t = useTranslations("Page");
  const common = useTranslations("Common");
  return (
    <EmptyState
      title={t("notFoundTitle")}
      description={t("notFoundDescription")}
      action={<Link href={ROUTES.HOME}>{common("home")}</Link>}
    />
  );
}
