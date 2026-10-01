"use client";

/**
 * 기사님의 보낸 견적 목록 페이지 상태를 조합합니다.
 *
 * 담당 기능:
 * - Infinite Query 실행
 * - 페이지별 데이터를 하나의 카드 배열로 병합
 * - loading/error/empty/success 상태 렌더링
 * - 견적 상세 페이지 이동
 * - 다음 페이지 조회
 */

import { useTranslations } from "next-intl";

import { useApiErrorMessage } from "@/common/api/useApiErrorMessage";
import { Button } from "@/common/components/button";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/common/components/page-state";
import { ROUTES } from "@/common/constants/routes";
import { useRouter } from "@/i18n/navigation";

import { useMoverQuotes } from "../mover-quote.hooks";
import { MoverQuoteCard } from "./MoverQuoteCard";
import { MoverQuoteTabs } from "./MoverQuoteTabs";

export function MoverQuoteListView() {
  const t = useTranslations("MoverQuote");
  const apiErrorMessage = useApiErrorMessage();
  const common = useTranslations("Common");
  const router = useRouter();
  const quotesQuery = useMoverQuotes();

  /**
   * useInfiniteQuery는 pages 배열로 데이터를 보관하므로 카드 목록에서
   * 사용하기 위해 각 페이지의 items를 하나의 배열로 합칩니다.
   */
  const quotes = quotesQuery.data?.pages.flatMap((page) => page.items) ?? [];

  const hasLoadedQuotes = quotes.length > 0;

  /**
   * 첫 조회가 실패해서 보여줄 기존 데이터가 없을 때만 전체 오류 화면을
   * 표시합니다.
   */
  const initialErrorMessage =
    quotesQuery.isError && !hasLoadedQuotes && quotesQuery.error
      ? apiErrorMessage(
          quotesQuery.error,
          t("loadError"),
        )
      : undefined;

  /**
   * 추가 페이지 조회가 실패해도 TanStack Query의 기존 pages는 유지됩니다.
   * 따라서 기존 카드를 숨기지 않고 목록 아래에 재시도 UI를 표시합니다.
   */
  const loadMoreErrorMessage =
    quotesQuery.isFetchNextPageError && quotesQuery.error
      ? apiErrorMessage(
          quotesQuery.error,
          t("loadMoreError"),
        )
      : undefined;

  const handleDetailClick = (quoteId: string) => {
    router.push(ROUTES.MOVER.QUOTE.DETAIL(quoteId));
  };

  return (
    <>
      <MoverQuoteTabs value="sent" />

      <main className="min-h-[calc(100vh-142px)] bg-[var(--background-100)]">
        {quotesQuery.isPending ? (
          <LoadingState message={t("loading")} />
        ) : initialErrorMessage ? (
          <ErrorState
            title={t("loadErrorTitle")}
            description={initialErrorMessage}
            onRetry={() => {
              void quotesQuery.refetch();
            }}
          />
        ) : quotes.length === 0 ? (
          <EmptyState
            title={t("empty")}
            description={t("emptyDescription")}
          />
        ) : (
          <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-6 py-16 max-[743px]:max-w-[375px] max-[743px]:py-6">
            <div className="grid grid-cols-1 items-start justify-items-center gap-6 min-[1200px]:grid-cols-2">
              {quotes.map((quote) => (
                <MoverQuoteCard
                  key={quote.id}
                  quote={quote}
                  onDetailClick={handleDetailClick}
                />
              ))}
            </div>

            {loadMoreErrorMessage ? (
              <div
                role="alert"
                className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-[var(--primary-200)] bg-[var(--primary-100)] px-6 py-5 text-center"
              >
                <p className="text-[14px] font-medium leading-6 text-[var(--primary-400)]">
                  {loadMoreErrorMessage}
                </p>

                <Button
                  type="button"
                  size="sm"
                  variant="outlined"
                  isLoading={quotesQuery.isFetchingNextPage}
                  onClick={() => {
                    void quotesQuery.fetchNextPage();
                  }}
                >
                  {common("retry")}
                </Button>
              </div>
            ) : quotesQuery.hasNextPage ? (
              <div className="flex justify-center">
                <Button
                  type="button"
                  size="sm"
                  variant="outlined"
                  isLoading={quotesQuery.isFetchingNextPage}
                  onClick={() => {
                    void quotesQuery.fetchNextPage();
                  }}
                >
                  {t("more")}
                </Button>
              </div>
            ) : null}
          </div>
        )}
      </main>
    </>
  );
}
