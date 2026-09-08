"use client";

import { Modal } from "@/common/components/MoverModal/Modal";

export interface DesignatedRequestGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestNormalQuote: () => void;
}

export function DesignatedRequestGuideModal({
  isOpen,
  onClose,
  onRequestNormalQuote,
}: DesignatedRequestGuideModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="지정 견적 요청하기"
      mobileLayout="centered"
    >
      <p className="text-2lg-medium text-[var(--black-300)]">
        일반 견적 요청을 먼저 진행해 주세요.
      </p>

      <button
        type="button"
        onClick={onRequestNormalQuote}
        className="h-16 w-full rounded-2xl bg-[var(--primary-400)] p-4 text-center text-[18px] leading-[26px] font-semibold text-[var(--gray-50)] max-[743px]:h-13.5 max-[743px]:rounded-xl max-[743px]:text-[16px]"
      >
        일반 견적 요청 하기
      </button>
    </Modal>
  );
}
