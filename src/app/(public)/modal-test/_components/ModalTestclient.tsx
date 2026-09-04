"use client";

import { useState } from "react";

import { SendQuoteModal } from "@/features/mover-requests/components/SendQuoteModal";
import type {
  ReceivedRequestViewModel,
  SendQuoteFormValue,
} from "@/features/mover-requests/mover-requests.types";

const MOCK_REQUEST: ReceivedRequestViewModel = {
  requestId: "request-1",
  customerName: "김인서",
  moveTypeLabel: "소형이사",
  isDesignated: true,
  requestedAt: "2024-07-01T09:00:00+09:00",
  requestedAtLabel: "1시간 전",
  departureLabel: "서울시 중구",
  arrivalLabel: "경기도 수원시",
  moveDate: "2024-07-01",
  moveDateLabel: "2024년 07월 01일 (월)",
};

export function ModalTestClient() {
  const [isOpen, setIsOpen] = useState(false);
  const [submittedValue, setSubmittedValue] =
    useState<SendQuoteFormValue | null>(null);

  const handleSubmit = (value: SendQuoteFormValue) => {
    setSubmittedValue(value);
    setIsOpen(false);
  };

  return (
    <main
      style={{
        display: "flex",
        minHeight: "100dvh",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "24px",
        padding: "24px",
      }}
    >
      <h1 className="text-2xl-semibold">견적 보내기 모달 테스트</h1>

      <button
        type="button"
        style={{
          height: "54px",
          padding: "0 32px",
          borderRadius: "12px",
          color: "var(--gray-50)",
          backgroundColor: "var(--primary-400)",
        }}
        className="text-lg-semibold"
        onClick={() => setIsOpen(true)}
      >
        모달 열기
      </button>

      {submittedValue && (
        <section>
          <h2 className="text-lg-semibold">전송 결과</h2>

          <p>견적가: {submittedValue.price.toLocaleString()}원</p>
          <p>코멘트: {submittedValue.comment}</p>
        </section>
      )}

      <SendQuoteModal
        isOpen={isOpen}
        request={MOCK_REQUEST}
        onClose={() => setIsOpen(false)}
        onSubmit={handleSubmit}
      />
    </main>
  );
}
