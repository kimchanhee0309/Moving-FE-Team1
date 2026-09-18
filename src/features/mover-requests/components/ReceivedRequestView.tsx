"use client";

/**
 * 기사님의 받은 요청 페이지를 구성하는 Client Component입니다.
 *
 * 담당 기능:
 * - 검색, 서비스 유형, 지정 요청, 정렬 조건 관리
 * - 받은 요청 Infinite Query 실행
 * - 견적 보내기/반려 모달 열기
 * - loading, error, empty, pagination 상태 렌더링
 *
 * API 호출과 응답 변환은 hooks/API 파일에 위임합니다.
 */
import { useDeferredValue, useEffect, useMemo, useState } from "react";

import { getApiErrorMessage } from "@/common/api/get-error-message";
import { Button } from "@/common/components/button";
import { SortDropdown } from "@/common/components/Dropdown";
import { SearchInput } from "@/common/components/Input";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/common/components/page-state";
import { SERVICE_TYPE, type ServiceType } from "@/common/constants/domain";
import { useModal } from "@/providers/ModalProvider";

import {
  useReceivedRequests,
  useRejectReceivedRequestMutation,
  useSendQuoteMutation,
} from "../mover-requests.hooks";
import type {
  ReceivedRequestSort,
  ReceivedRequestViewModel,
  RejectRequestFormValue,
  SendQuoteFormValue,
} from "../mover-requests.types";
import { ReceivedRequestCard } from "./ReceivedRequestCard";
import { RejectRequestModal } from "./RejectRequestModal";
import { SendQuoteModal } from "./SendQuoteModal";

const SERVICE_FILTERS = [
  {
    value: SERVICE_TYPE.SMALL,
    label: "소형이사",
  },
  {
    value: SERVICE_TYPE.HOME,
    label: "가정이사",
  },
  {
    value: SERVICE_TYPE.OFFICE,
    label: "사무실이사",
  },
] satisfies {
  value: ServiceType;
  label: string;
}[];

const SORT_OPTIONS = [
  {
    value: "MOVE_DATE_ASC",
    label: "이사 빠른순",
  },
  {
    value: "REQUESTED_AT_DESC",
    label: "최근 요청 순",
  },
] as const;

function isReceivedRequestSort(value: string): value is ReceivedRequestSort {
  return SORT_OPTIONS.some((option) => option.value === value);
}

interface SendQuoteModalContentProps {
  request: ReceivedRequestViewModel;
  onClose: () => void;
}

/**
 * 견적 보내기 모달과 mutation을 연결하는 컨테이너입니다.
 *
 * 전역 ModalProvider에는 ReactNode가 저장되므로 mutation 상태를 이
 * 컴포넌트 내부에서 관리해야 isSubmitting과 serverError가 변경될 때
 * 모달이 다시 렌더링됩니다.
 */
function SendQuoteModalContent({
  request,
  onClose,
}: SendQuoteModalContentProps) {
  const mutation = useSendQuoteMutation();
  const { setModalDismissible } = useModal();

  /**
   * 요청을 전송하는 동안에는 닫기 버튼뿐만 아니라 Escape와 backdrop
   * 클릭도 막습니다. 요청 성공 시 호출하는 onClose는 dismissal 정책과
   * 관계없이 모달을 닫을 수 있습니다.
   */
  useEffect(() => {
    setModalDismissible(!mutation.isPending);

    return () => {
      // 모달이 닫히거나 다른 모달로 교체될 때 다음 모달의 닫기 정책이
      // 잠긴 상태로 남지 않도록 기본값을 복구합니다.
      setModalDismissible(true);
    };
  }, [mutation.isPending, setModalDismissible]);

  const handleSubmit = (value: SendQuoteFormValue) => {
    if (mutation.isPending) {
      return;
    }

    mutation.mutate(
      {
        requestId: request.requestId,
        value,
      },
      {
        onSuccess: onClose,
      },
    );
  };

  return (
    <SendQuoteModal
      request={request}
      isSubmitting={mutation.isPending}
      serverError={
        mutation.error
          ? getApiErrorMessage(
              mutation.error,
              "견적을 보내지 못했습니다. 다시 시도해 주세요.",
            )
          : undefined
      }
      onClose={onClose}
      onSubmit={handleSubmit}
    />
  );
}

interface RejectRequestModalContentProps {
  request: ReceivedRequestViewModel;
  onClose: () => void;
}

/**
 * 반려 요청 모달과 mutation을 연결하는 컨테이너입니다.
 */
function RejectRequestModalContent({
  request,
  onClose,
}: RejectRequestModalContentProps) {
  const mutation = useRejectReceivedRequestMutation();
  const { setModalDismissible } = useModal();

  /**
   * 반려 요청이 진행되는 동안 Escape와 backdrop 닫기를 막습니다.
   */
  useEffect(() => {
    setModalDismissible(!mutation.isPending);

    return () => {
      setModalDismissible(true);
    };
  }, [mutation.isPending, setModalDismissible]);

  const handleSubmit = (value: RejectRequestFormValue) => {
    if (mutation.isPending) {
      return;
    }

    mutation.mutate(
      {
        requestId: request.requestId,
        value,
      },
      {
        onSuccess: onClose,
      },
    );
  };

  return (
    <RejectRequestModal
      request={request}
      isSubmitting={mutation.isPending}
      serverError={
        mutation.error
          ? getApiErrorMessage(
              mutation.error,
              "요청을 반려하지 못했습니다. 다시 시도해 주세요.",
            )
          : undefined
      }
      onClose={onClose}
      onSubmit={handleSubmit}
    />
  );
}

export function ReceivedRequestsView() {
  const { openModal, closeModal } = useModal();

  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedService, setSelectedService] = useState<ServiceType | null>(
    null,
  );
  const [designatedOnly, setDesignatedOnly] = useState(false);
  const [sortValue, setSortValue] =
    useState<ReceivedRequestSort>("REQUESTED_AT_DESC");
  const [isSortOpen, setIsSortOpen] = useState(false);

  /**
   * 입력값을 바로 API query에 넣지 않고 deferred 값을 사용합니다.
   * 연속 입력 중 화면 갱신 우선순위를 낮추면서 최신 검색어를 조회합니다.
   */
  const deferredKeyword = useDeferredValue(searchKeyword.trim());

  const query = useMemo(
    () => ({
      keyword: deferredKeyword.length > 0 ? deferredKeyword : undefined,
      serviceType: selectedService ?? undefined,
      isDesignated: designatedOnly ? true : undefined,
      sort: sortValue,
      limit: 10,
    }),
    [deferredKeyword, designatedOnly, selectedService, sortValue],
  );

  const receivedRequestsQuery = useReceivedRequests(query);

  /**
   * useInfiniteQuery가 페이지 단위로 보관한 items를 카드에서 사용할
   * 하나의 배열로 합칩니다.
   */
  const requests =
    receivedRequestsQuery.data?.pages.flatMap((page) => page.items) ?? [];

  const handleOpenSendQuote = (requestId: string) => {
    const request = requests.find((item) => item.requestId === requestId);

    if (!request) {
      return;
    }

    openModal(
      <SendQuoteModalContent request={request} onClose={closeModal} />,
      {
        ariaLabel: "견적 보내기",
      },
    );
  };

  const handleOpenRejectRequest = (requestId: string) => {
    const request = requests.find((item) => item.requestId === requestId);

    if (!request) {
      return;
    }

    openModal(
      <RejectRequestModalContent request={request} onClose={closeModal} />,
      {
        ariaLabel: "반려 요청",
      },
    );
  };

  const handleSortChange = (value: string) => {
    if (isReceivedRequestSort(value)) {
      setSortValue(value);
    }
  };

  const hasActiveFilter =
    searchKeyword.trim().length > 0 ||
    selectedService !== null ||
    designatedOnly;

  const hasLoadedRequests = requests.length > 0;

  /**
   * 첫 조회가 실패해 표시할 기존 카드가 없을 때만 전체 ErrorState를
   * 보여줍니다. 이미 받은 페이지가 있다면 오류가 발생해도 기존 카드를
   * 숨기지 않습니다.
   */
  const initialErrorMessage =
    receivedRequestsQuery.isError &&
    !hasLoadedRequests &&
    receivedRequestsQuery.error
      ? getApiErrorMessage(
          receivedRequestsQuery.error,
          "받은 요청을 불러오지 못했습니다.",
        )
      : undefined;

  /**
   * 추가 페이지 조회 실패는 기존 목록을 유지한 채 목록 아래에 표시합니다.
   * useInfiniteQuery는 fetchNextPage 실패 후에도 기존 pages를 캐시에
   * 보존하므로 이를 전체 ErrorState로 덮지 않아야 합니다.
   */
  const loadMoreErrorMessage =
    receivedRequestsQuery.isFetchNextPageError && receivedRequestsQuery.error
      ? getApiErrorMessage(
          receivedRequestsQuery.error,
          "추가 요청을 불러오지 못했습니다. 다시 시도해 주세요.",
        )
      : undefined;

  return (
    <>
      <section className="border-b border-[var(--line-100)] bg-white">
        <div className="mx-auto w-full max-w-[1200px] px-6 py-8 max-[743px]:py-[10px]">
          <h1 className="text-[24px] font-semibold leading-8 text-[var(--black-500)] max-[743px]:text-[18px]">
            받은 요청
          </h1>
        </div>
      </section>

      <main className="mx-auto flex w-full max-w-[1200px] flex-col gap-10 px-6 py-10 max-[743px]:max-w-[375px] max-[743px]:gap-6 max-[743px]:py-6">
        <section className="flex flex-col gap-6">
          <div className="hidden min-[744px]:block">
            <SearchInput
              label="고객 검색"
              inputSize="md"
              placeholder="어떤 고객님을 찾고 계세요?"
              value={searchKeyword}
              onChange={(event) => setSearchKeyword(event.target.value)}
              onClear={() => setSearchKeyword("")}
              containerClassName="!max-w-none"
            />
          </div>

          <div className="hidden gap-3 min-[744px]:flex">
            {SERVICE_FILTERS.map((service) => {
              const isSelected = selectedService === service.value;

              return (
                <button
                  key={service.value}
                  type="button"
                  aria-pressed={isSelected}
                  className={[
                    "rounded-full border px-5 py-[10px]",
                    "text-[18px] leading-[26px]",
                    "focus-visible:outline-2 focus-visible:outline-offset-2",
                    "focus-visible:outline-[var(--primary-400)]",
                    isSelected
                      ? "border-[var(--primary-400)] bg-[var(--primary-100)] font-medium text-[var(--primary-400)]"
                      : "border-[var(--gray-300)] bg-[var(--background-100)] text-[var(--black-400)]",
                  ].join(" ")}
                  onClick={() =>
                    setSelectedService(isSelected ? null : service.value)
                  }
                >
                  {service.label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <div className="flex items-center justify-between gap-4">
            <strong className="text-[18px] font-semibold max-[743px]:text-[13px]">
              받은 요청 {requests.length}
              {receivedRequestsQuery.hasNextPage ? "건 이상" : "건"}
            </strong>

            <div className="flex items-center gap-3">
              <label className="hidden items-center gap-2 min-[744px]:flex">
                <input
                  type="checkbox"
                  checked={designatedOnly}
                  className="size-5 accent-[var(--primary-400)]"
                  onChange={(event) => setDesignatedOnly(event.target.checked)}
                />

                <span className="text-[16px]">지정 견적 요청</span>
              </label>

              <SortDropdown
                options={SORT_OPTIONS}
                value={sortValue}
                isOpen={isSortOpen}
                size="md"
                disabled={receivedRequestsQuery.isPending}
                onChange={handleSortChange}
                onOpenChange={setIsSortOpen}
              />
            </div>
          </div>

          {receivedRequestsQuery.isPending ? (
            <LoadingState message="받은 요청을 불러오는 중이에요" />
          ) : initialErrorMessage ? (
            <ErrorState
              title="받은 요청을 불러오지 못했어요."
              description={initialErrorMessage}
              onRetry={() => {
                void receivedRequestsQuery.refetch();
              }}
            />
          ) : requests.length === 0 ? (
            <EmptyState
              title={
                hasActiveFilter
                  ? "조건에 맞는 받은 요청이 없어요."
                  : "받은 요청이 없어요."
              }
              description={
                hasActiveFilter
                  ? "검색어나 필터 조건을 다시 확인해 주세요."
                  : "새로운 견적 요청이 도착하면 이곳에 표시돼요."
              }
            />
          ) : (
            <>
              <div className="grid grid-cols-1 items-start justify-items-center gap-6 min-[1200px]:grid-cols-2">
                {requests.map((request) => (
                  <ReceivedRequestCard
                    key={request.requestId}
                    request={request}
                    onSendQuote={handleOpenSendQuote}
                    onReject={handleOpenRejectRequest}
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
                    isLoading={receivedRequestsQuery.isFetchingNextPage}
                    onClick={() => {
                      void receivedRequestsQuery.fetchNextPage();
                    }}
                  >
                    다시 시도
                  </Button>
                </div>
              ) : receivedRequestsQuery.hasNextPage ? (
                <div className="flex justify-center">
                  <Button
                    type="button"
                    size="sm"
                    variant="outlined"
                    isLoading={receivedRequestsQuery.isFetchingNextPage}
                    onClick={() => {
                      void receivedRequestsQuery.fetchNextPage();
                    }}
                  >
                    더 보기
                  </Button>
                </div>
              ) : null}
            </>
          )}
        </section>
      </main>
    </>
  );
}
