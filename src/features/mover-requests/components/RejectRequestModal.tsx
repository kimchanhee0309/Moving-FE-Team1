"use client";

import { useEffect, useId, useState, type FormEvent } from "react";

import { Modal } from "@/common/components/MoverModal/Modal";

import type {
  ReceivedRequestViewModel,
  RejectRequestFormValue,
} from "../mover-requests.types";
import { RequestModalSummary } from "./RequestInfo";

interface RejectRequestModalProps {
  isOpen: boolean;
  request: ReceivedRequestViewModel;
  isSubmitting?: boolean;
  serverError?: string;
  onClose: () => void;
  onSubmit: (value: RejectRequestFormValue) => void;
}

export function RejectRequestModal({
  isOpen,
  request,
  isSubmitting = false,
  serverError,
  onClose,
  onSubmit,
}: RejectRequestModalProps) {
  const reasonId = useId();
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (isOpen) {
      setReason("");
    }
  }, [isOpen, request.requestId]);

  const trimmedReason = reason.trim();

  const canSubmit = trimmedReason.length >= 10 && !isSubmitting;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    onSubmit({
      reason: trimmedReason,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      title="반려요청"
      onClose={onClose}
      closeOnBackdrop={!isSubmitting}
    >
      <form
        className="flex w-full flex-col gap-10 max-md:gap-[26px]"
        aria-busy={isSubmitting}
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col gap-8 max-md:gap-5">
          <RequestModalSummary request={request} hideMobileDivider />

          <div className="flex flex-col gap-4">
            <label
              className="text-[20px] font-semibold leading-8 text-[var(--black-300)] max-md:text-[16px] max-md:leading-[26px]"
              htmlFor={reasonId}
            >
              반려 사유를 입력해 주세요
            </label>

            <textarea
              id={reasonId}
              className="h-40 w-full resize-none overflow-y-auto rounded-2xl border border-[var(--line-200)] bg-[var(--gray-50)] px-6 py-[14px] text-[18px] font-normal leading-8 text-[var(--content-strong)] outline-none placeholder:text-[var(--content-placeholder)] focus:border-[var(--primary-400)] disabled:cursor-not-allowed disabled:bg-[var(--background-200)] max-md:px-4 max-md:text-[16px] max-md:leading-[26px]"
              placeholder="최소 10자 이상 입력해주세요"
              minLength={10}
              value={reason}
              disabled={isSubmitting}
              data-autofocus
              onChange={(event) => setReason(event.target.value)}
            />
          </div>

          {serverError && (
            <p
              className="text-[14px] font-medium leading-6 text-[var(--primary-400)]"
              role="alert"
            >
              {serverError}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="flex h-16 w-full items-center justify-center rounded-2xl bg-[var(--primary-400)] p-4 text-[18px] font-semibold leading-[26px] text-[var(--gray-50)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-400)] disabled:cursor-not-allowed disabled:bg-[var(--gray-300)] max-md:h-[54px] max-md:rounded-xl max-md:text-[16px]"
          disabled={!canSubmit}
        >
          {isSubmitting ? "처리 중..." : "반려하기"}
        </button>
      </form>
    </Modal>
  );
}
