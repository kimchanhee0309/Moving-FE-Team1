"use client";

import { useMemo, useState } from "react";

import { SortDropdown } from "@/common/components/Dropdown/SortDropdown";
import { SearchInput } from "@/common/components/Input/SearchInput";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/common/components/page-state";
import { SERVICE_TYPE, type ServiceType } from "@/common/constants/domain";
import { useModal } from "@/providers/modal-provider";

import type { ReceivedRequestViewModel } from "../mover-requests.types";
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

interface ReceivedRequestsViewProps {
  requests: ReceivedRequestViewModel[];
  isLoading?: boolean;
  error?: string;
  onRetry?: () => void;
}

export function ReceivedRequestsView({
  requests,
  isLoading = false,
  error,
  onRetry,
}: ReceivedRequestsViewProps) {
  const { openModal, closeModal } = useModal();

  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedService, setSelectedService] = useState<ServiceType | null>(
    null,
  );
  const [designatedOnly, setDesignatedOnly] = useState(false);
  const [sortValue, setSortValue] = useState("REQUESTED_AT_DESC");
  const [isSortOpen, setIsSortOpen] = useState(false);

  const filteredRequests = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();

    return requests
      .filter((request) => {
        const matchesKeyword =
          keyword.length === 0 ||
          request.customerName.toLowerCase().includes(keyword);

        const matchesService =
          selectedService === null || request.serviceType === selectedService;

        const matchesDesignated = !designatedOnly || request.isDesignated;

        return matchesKeyword && matchesService && matchesDesignated;
      })
      .sort((firstRequest, secondRequest) => {
        if (sortValue === "REQUESTED_AT_DESC") {
          return (
            new Date(secondRequest.requestedAt).getTime() -
            new Date(firstRequest.requestedAt).getTime()
          );
        }

        return (
          new Date(firstRequest.moveDate).getTime() -
          new Date(secondRequest.moveDate).getTime()
        );
      });
  }, [designatedOnly, requests, searchKeyword, selectedService, sortValue]);

  const findRequest = (requestId: string) =>
    requests.find((request) => request.requestId === requestId);

  const handleOpenSendQuote = (requestId: string) => {
    const request = findRequest(requestId);

    if (!request) {
      return;
    }

    openModal(
      <SendQuoteModal
        request={request}
        onClose={closeModal}
        onSubmit={closeModal}
      />,
    );
  };

  const handleOpenRejectRequest = (requestId: string) => {
    const request = findRequest(requestId);

    if (!request) {
      return;
    }

    openModal(
      <RejectRequestModal
        request={request}
        onClose={closeModal}
        onSubmit={closeModal}
      />,
    );
  };

  const hasActiveFilter =
    searchKeyword.trim().length > 0 ||
    selectedService !== null ||
    designatedOnly;

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
              isLoading={isLoading}
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
                      ? "border-[var(--primary-400)] bg-[var(--primary-100)] font-medium texxt-[var(--primary-400)]"
                      : "border-[var(--gray-300)] bg-[var(--backgroud-100)] text-[var(--black-400)]",
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
              전체 {filteredRequests.length}건
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
                disabled={isLoading}
                onChange={setSortValue}
                onOpenChange={setIsSortOpen}
              />
            </div>
          </div>

          {isLoading ? (
            <LoadingState message="받은 요청을 불러오는 중이에요." />
          ) : error ? (
            <ErrorState
              title="받은 요청을 불러오지 못했어요."
              description={error}
              onRetry={onRetry}
            />
          ) : filteredRequests.length === 0 ? (
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
            <div className="grid grid-cols-1 items-start justify-items-center gap-6 min-[1200px]:grid-cols-2">
              {filteredRequests.map((request) => (
                <ReceivedRequestCard
                  key={request.requestId}
                  request={request}
                  onSendQuote={handleOpenSendQuote}
                  onReject={handleOpenRejectRequest}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
