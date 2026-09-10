"use client";

import { useState, type FormEvent } from "react";

import { Modal } from "@/common/components/MoverModal/Modal";
import { Button } from "@/common/components/Button";
import { Textarea } from "@/common/components/Input";

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
  const [reason, setReason] = useState("");

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

          <Textarea
            label="반려 사유를 입력해 주세요"
            inputSize="md"
            placeholder="최소 10자 이상 입력해주세요"
            minLength={10}
            value={reason}
            disabled={isSubmitting}
            containerClassName="!max-w-none"
            data-autofocus
            onChange={(event) => setReason(event.target.value)}
          />

          {serverError ? (
            <p
              className="text-[14px] font-medium leading-6 text-[var(--primary-400)]"
              role="alert"
            >
              {serverError}
            </p>
          ) : null}
        </div>

        <Button
          type="submit"
          size="md"
          fullWidth
          isLoading={isSubmitting}
          disabled={!canSubmit}
        >
          반려하기
        </Button>
      </form>
    </Modal>
  );
}
