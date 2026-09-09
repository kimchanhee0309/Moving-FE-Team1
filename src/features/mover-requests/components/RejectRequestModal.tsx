"use client";

import { useState, type FormEvent } from "react";

import { Textarea } from "@/common/components/Input";
import { Button } from "@/common/components/button";

import type {
  ReceivedRequestViewModel,
  RejectRequestFormValue,
} from "../mover-requests.types";
import { RequestInfo } from "./RequestInfo";
import { RequestModalPanel } from "./RequestModalPanel";

interface RejectRequestModalProps {
  request: ReceivedRequestViewModel;
  isSubmitting?: boolean;
  serverError?: string;
  onClose: () => void;
  onSubmit: (value: RejectRequestFormValue) => void;
}

export function RejectRequestModal({
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
    <RequestModalPanel
      title="반려 요청"
      isSubmitting={isSubmitting}
      onClose={onClose}
    >
      <form
        className="flex w-full flex-col gap-10 max-[743px]:gap-[26px]"
        aria-busy={isSubmitting}
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col gap-8 max-[743px]:gap-5">
          <RequestInfo request={request} hideMobileDivider />

          <Textarea
            label="반려 사유를 입력해 주세요"
            inputSize="md"
            placeholder="최소 10자 이상 입력해주세요"
            minLength={10}
            value={reason}
            required
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
    </RequestModalPanel>
  );
}
