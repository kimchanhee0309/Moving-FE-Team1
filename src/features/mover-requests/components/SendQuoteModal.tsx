"use client";

import Image from "next/image";
import { useState, type ChangeEvent, type FormEvent } from "react";

import { Modal } from "@/common/components/MoverModal/Modal";
import { Input, Textarea } from "@/common/components/Input";
import { Button } from "@/common/components/Button";

import type {
  ReceivedRequestViewModel,
  SendQuoteFormValue,
} from "../mover-requests.types";
import { RequestModalSummary } from "./RequestInfo";

interface SendQuoteModalProps {
  isOpen: boolean;
  request: ReceivedRequestViewModel;
  isSubmitting?: boolean;
  serverError?: string;
  onClose: () => void;
  onSubmit: (value: SendQuoteFormValue) => void;
}

export function SendQuoteModal({
  isOpen,
  request,
  isSubmitting = false,
  serverError,
  onClose,
  onSubmit,
}: SendQuoteModalProps) {
  const [priceInput, setPriceInput] = useState("");
  const [comment, setComment] = useState("");

  const price = priceInput === "" ? 0 : Number(priceInput);

  const trimmedComment = comment.trim();

  const isValidPrice = Number.isSafeInteger(price) && price > 0;

  const canSubmit =
    isValidPrice && trimmedComment.length >= 10 && !isSubmitting;

  const formattedPrice =
    priceInput === "" ? "" : Number(priceInput).toLocaleString("ko-KR");

  const handlePriceChange = (event: ChangeEvent<HTMLInputElement>) => {
    const digits = event.target.value.replace(/\D/g, "");

    setPriceInput(digits);
  };

  const handleCommentChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setComment(event.target.value);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    onSubmit({
      price,
      comment: trimmedComment,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      title="견적 보내기"
      closeOnBackdrop={!isSubmitting}
      onClose={onClose}
    >
      <form
        className="flex w-full flex-col gap-10 max-md:gap-[26px]"
        aria-busy={isSubmitting}
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col gap-8 max-md:gap-5">
          <RequestModalSummary request={request} />

          <Input
            label="견적가를 입력해 주세요"
            inputSize="md"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="견적가 입력"
            value={formattedPrice}
            disabled={isSubmitting}
            containerClassName="!max-w-none"
            trailingIcon={
              <Image
                src="/icons/mover-request/visibiity-off.svg"
                alt=""
                width={24}
                height={24}
              />
            }
            data-autofocus
            onChange={handlePriceChange}
          />

          <Textarea
            label="코멘트를 입력해 주세요"
            inputSize="md"
            placeholder="최소 10자 이상 입력해주세요"
            minLength={10}
            value={comment}
            disabled={isSubmitting}
            containerClassName="!max-w-none"
            onChange={handleCommentChange}
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
          견적 보내기
        </Button>
      </form>
    </Modal>
  );
}
