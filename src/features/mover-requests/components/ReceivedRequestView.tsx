"use client";

import { useMemo, useState } from "react";

import { SortDropdown } from "@/common/components/Dropdown/SortDropdown";
import { SearchInput } from "@/common/components/Input/SearchInput";

import type {
  ReceivedRequestViewModel,
  RejectRequestFormValue,
  SendQuoteFormValue,
} from "../mover-requests.types";
import { ReceivedRequestCard } from "./ReceivedRequestCard";
import { RejectRequestModal } from "./RejectRequestModal";
import { SendQuoteModal } from "./SendQuoteModal";

const SERVICE_FILTERS = ["소형이사", "가정이사", "사무실이사"] as const;

const SORT_OPTIONS = [
  {
    value: "MOVE_DATE_ASC",
    label: "이사 빠른순",
  },
  {
    value: "REQUESTED_AT_ASC",
    label: "요청일 빠른순",
  },
] as const;

interface ReceivedRequestsViewProps {
  requests: ReceivedRequestViewModel[];
}

type ActiveModal = "send" | "reject" | null;

export function ReceivedRequestsView({ requests }: ReceivedRequestsViewProps) {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [designatedOnly, setDesignatedOnly] = useState(false);

  const [sortValue, setSortValue] = useState("MOVE_DATE_ASC");
  const [isSortOpen, setIsSortOpen] = useState(false);

  const [selectedRequest, setSelectedRequest] =
    useState<ReceivedRequestViewModel | null>(null);
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);

  const filteredRequests = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();

    return requests
      .filter((request) => {
        const matchesKeyword =
          keyword.length === 0 ||
          request.customerName.toLowerCase().includes(keyword);

        const matchesService =
          selectedService === null || request.moveTypeLabel === selectedService;

        const matchesDesignated = !designatedOnly || request.isDesignated;

        return matchesKeyword && matchesService && matchesDesignated;
      })
      .sort((a, b) => {
        if (sortValue === "REQUESTED_AT_ASC") {
          return (
            new Date(a.requestedAt).getTime() -
            new Date(b.requestedAt).getTime()
          );
        }

        return new Date(a.moveDate).getTime() - new Date(b.moveDate).getTime();
      });
  }, [designatedOnly, requests, searchKeyword, selectedService, sortValue]);

  const openModal = (modal: Exclude<ActiveModal, null>, requestId: string) => {
    const request = requests.find((item) => item.requestId === requestId);

    if (!request) {
      return;
    }

    setSelectedRequest(request);
    setActiveModal(modal);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const handleSendQuote = (value: SendQuoteFormValue) => {
    console.log("견적 보내기", {
      requestId: selectedRequest?.requestId,
      ...value,
    });

    closeModal();
  };

  const handleReject = (value: RejectRequestFormValue) => {
    console.log("요청 반려", {
      requestId: selectedRequest?.requestId,
      ...value,
    });

    closeModal();
  };

  return (
    <>
      <section className="border-b border-[var(--line-100)] bg-white">
        <div className="mx-auto w-full max-w-[1200px] px-6 py-8 max-md:px-6 max-md:py-[10px]">
          <h1 className="text-[24px] font-semibold leading-8 text-[var(--black-500)] max-md:text-[18px]">
            받은 요청
          </h1>
        </div>
      </section>

      <main className="mx-auto flex w-full max-w-[1200px] flex-col gap-10 px-6 py-10 max-md:max-w-[375px] max-md:gap-6 max-md:px-6 max-md:py-6">
        <section className="flex flex-col gap-6">
          <div className="hidden md:block">
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

          <div className="md:hidden">
            <SearchInput
              label="고객 검색"
              inputSize="sm"
              placeholder="어떤 고객님을 찾고 계세요?"
              value={searchKeyword}
              onChange={(event) => setSearchKeyword(event.target.value)}
              onClear={() => setSearchKeyword("")}
              containerClassName="!max-w-none"
            />
          </div>

          <div className="flex gap-3 max-md:hidden">
            {SERVICE_FILTERS.map((service) => {
              const isSelected = selectedService === service;

              return (
                <button
                  key={service}
                  type="button"
                  className={[
                    "rounded-full border px-5 py-[10px] text-[18px] leading-[26px]",
                    isSelected
                      ? "border-[var(--primary-400)] bg-[var(--primary-100)] font-medium text-[var(--primary-400)]"
                      : "border-[var(--gray-300)] bg-[var(--background-100)] text-[var(--black-400)]",
                  ].join(" ")}
                  onClick={() =>
                    setSelectedService(isSelected ? null : service)
                  }
                >
                  {service}
                </button>
              );
            })}
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <strong className="text-[18px] font-semibold max-md:text-[13px]">
              전체 {filteredRequests.length}건
            </strong>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 max-md:hidden">
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
                onChange={setSortValue}
                onOpenChange={setIsSortOpen}
              />
            </div>
          </div>

          {filteredRequests.length > 0 ? (
            <div className="grid grid-cols-2 items-start gap-6 max-lg:grid-cols-1 max-lg:justify-items-center">
              {filteredRequests.map((request) => (
                <ReceivedRequestCard
                  key={request.requestId}
                  request={request}
                  onSendQuote={(requestId) => openModal("send", requestId)}
                  onReject={(requestId) => openModal("reject", requestId)}
                />
              ))}
            </div>
          ) : (
            <div className="flex min-h-[400px] items-center justify-center text-[var(--content-muted)]">
              조건에 맞는 받은 요청이 없어요.
            </div>
          )}
        </section>
      </main>

      {selectedRequest && (
        <>
          <SendQuoteModal
            isOpen={activeModal === "send"}
            request={selectedRequest}
            onClose={closeModal}
            onSubmit={handleSendQuote}
          />

          <RejectRequestModal
            isOpen={activeModal === "reject"}
            request={selectedRequest}
            onClose={closeModal}
            onSubmit={handleReject}
          />
        </>
      )}
    </>
  );
}
