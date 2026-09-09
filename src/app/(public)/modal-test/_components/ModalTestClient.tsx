"use client";

import { useState } from "react";

import { MOVE_REQUEST_STATUS, QUOTE_STATUS } from "@/common/constants/domain";
import { MoverQuoteCard } from "@/features/mover-quote/components/MoverQuoteCard";
import { RejectedRequestCard } from "@/features/mover-quote/components/RejectedRequestCard";
import {
  MOCK_MOVER_QUOTES,
  MOCK_REJECTED_REQUESTS,
} from "@/features/mover-quote/mover-quote.mock";
import type { MoverQuoteCardData } from "@/features/mover-quote/mover-quote.types";
import { ReceivedRequestCard } from "@/features/mover-requests/components/ReceivedRequestCard";
import { RejectRequestModal } from "@/features/mover-requests/components/RejectRequestModal";
import { SendQuoteModal } from "@/features/mover-requests/components/SendQuoteModal";
import { MOCK_RECEIVED_REQUESTS } from "@/features/mover-requests/mover-requests.mock";
import type {
  ReceivedRequestViewModel,
  RejectRequestFormValue,
  SendQuoteFormValue,
} from "@/features/mover-requests/mover-requests.types";

type ActiveModal = "send-quote" | "reject-request" | null;

export function ModalTestClient() {
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);

  const [selectedRequest, setSelectedRequest] =
    useState<ReceivedRequestViewModel | null>(null);

  const [testMessage, setTestMessage] = useState(
    "카드의 버튼을 눌러 동작을 확인해 주세요.",
  );

  const openModal = (modal: Exclude<ActiveModal, null>, requestId: string) => {
    const request = MOCK_RECEIVED_REQUESTS.find(
      (item) => item.requestId === requestId,
    );

    if (!request) {
      setTestMessage("요청 정보를 찾을 수 없습니다.");
      return;
    }

    setSelectedRequest(request);
    setActiveModal(modal);
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedRequest(null);
  };

  const handleSendQuote = (value: SendQuoteFormValue) => {
    if (!selectedRequest) {
      return;
    }

    setTestMessage(
      [
        "견적 보내기 테스트 완료",
        `고객: ${selectedRequest.customerName}`,
        `견적 금액: ${value.price.toLocaleString("ko-KR")}원`,
        `코멘트: ${value.comment}`,
      ].join(" / "),
    );

    closeModal();
  };

  const handleRejectRequest = (value: RejectRequestFormValue) => {
    if (!selectedRequest) {
      return;
    }

    setTestMessage(
      [
        "요청 반려 테스트 완료",
        `고객: ${selectedRequest.customerName}`,
        `반려 사유: ${value.reason}`,
      ].join(" / "),
    );

    closeModal();
  };

  const handleQuoteDetail = (quoteId: string) => {
    setTestMessage(`견적 상세보기 클릭: ${quoteId}`);
  };

  return (
    <main className="min-h-screen bg-[var(--background-200)] px-5 py-10">
      <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-16">
        <header className="flex flex-col gap-3">
          <h1 className="text-[32px] font-bold leading-[42px] text-[var(--black-400)] max-md:text-[24px] max-md:leading-8">
            기사님 컴포넌트 UI 테스트
          </h1>

          <p className="text-[16px] leading-[26px] text-[var(--content-muted)]">
            API 요청 없이 카드 상태와 모달 동작을 확인하는 페이지입니다.
          </p>

          <output className="rounded-xl border border-[var(--line-200)] bg-white px-4 py-3 text-[14px] leading-6 text-[var(--black-300)]">
            {testMessage}
          </output>
        </header>

        <section className="flex flex-col gap-8">
          <div>
            <h2 className="text-[24px] font-bold leading-8 text-[var(--black-400)]">
              받은 요청 카드
            </h2>

            <p className="mt-2 text-[14px] leading-6 text-[var(--content-muted)]">
              견적 보내기와 반려하기 버튼을 눌러 모달을 확인해 주세요.
            </p>
          </div>

          <div className="grid grid-cols-2 items-start gap-6 max-lg:grid-cols-1">
            {MOCK_RECEIVED_REQUESTS.map((request) => (
              <ReceivedRequestCard
                key={request.requestId}
                request={request}
                onSendQuote={(requestId) => openModal("send-quote", requestId)}
                onReject={(requestId) => openModal("reject-request", requestId)}
              />
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-8">
          <div>
            <h2 className="text-[24px] font-bold leading-8 text-[var(--black-400)]">
              보낸 견적 카드
            </h2>

            <p className="mt-2 text-[14px] leading-6 text-[var(--content-muted)]">
              대기, 확정, 이사 완료 상태를 비교할 수 있습니다.
            </p>
          </div>

          <div className="grid grid-cols-2 items-start gap-6 max-lg:grid-cols-1">
            {MOCK_MOVER_QUOTES.map((quote) => (
              <div key={quote.id} className="flex flex-col gap-3">
                <p className="text-[14px] font-semibold text-[var(--black-300)]">
                  {getQuoteStateLabel(quote)}
                </p>

                <MoverQuoteCard
                  quote={quote}
                  onDetailClick={handleQuoteDetail}
                />
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-8">
          <div>
            <h2 className="text-[24px] font-bold leading-8 text-[var(--black-400)]">
              반려된 요청 카드
            </h2>

            <p className="mt-2 text-[14px] leading-6 text-[var(--content-muted)]">
              반려 요청 오버레이가 카드 전체에 표시되는지 확인해 주세요.
            </p>
          </div>

          <div className="grid grid-cols-2 items-start gap-6 max-lg:grid-cols-1">
            {MOCK_REJECTED_REQUESTS.map((request) => (
              <RejectedRequestCard key={request.id} request={request} />
            ))}
          </div>
        </section>
      </div>

      {selectedRequest && activeModal === "send-quote" ? (
        <SendQuoteModal
          key={`send-${selectedRequest.requestId}`}
          isOpen
          request={selectedRequest}
          onClose={closeModal}
          onSubmit={handleSendQuote}
        />
      ) : null}

      {selectedRequest && activeModal === "reject-request" ? (
        <RejectRequestModal
          key={`reject-${selectedRequest.requestId}`}
          isOpen
          request={selectedRequest}
          onClose={closeModal}
          onSubmit={handleRejectRequest}
        />
      ) : null}
    </main>
  );
}

function getQuoteStateLabel(quote: MoverQuoteCardData) {
  const isConfirmed = quote.quoteStatus === QUOTE_STATUS.CONFIRMED;

  const isCompleted = quote.moveRequestStatus === MOVE_REQUEST_STATUS.COMPLETED;

  if (isConfirmed && isCompleted) {
    return "확정 견적 · 이사 완료";
  }

  if (isCompleted) {
    return "이사 완료";
  }

  if (isConfirmed) {
    return "확정 견적";
  }

  return "대기 중인 견적";
}
