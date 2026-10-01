import { useTranslations } from "next-intl";

/** 기존 메뉴 계약의 한국어 label을 유지하며 렌더링 시에만 번역합니다. */
export function useGnbLabel() {
  const t = useTranslations("Common");
  const labels: Record<string, string> = {
    "기사님 찾기": t("findMover"),
    "견적 요청": t("requestQuote"),
    "내 견적 관리": t("manageQuotes"),
    "받은 요청": t("receivedRequests"),
    "프로필 수정": t("editProfile"),
    "찜한 기사님": t("favoriteMovers"),
    "이사 리뷰": t("movingReviews"),
    "마이페이지": t("myPage"),
  };
  return (label: string) => labels[label] ?? label;
}
