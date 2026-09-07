"use client";

import Image from "next/image";
import {
  useEffect,
  useId,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import { Modal } from "@/common/components/MoverModal/Modal";

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
  const priceId = useId();
  const commentId = useId();

  const [priceInput, setPriceInput] = useState("");
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (isOpen) {
      setPriceInput("");
      setComment("");
    }
  }, [isOpen, request.requestId]);

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
      onClose={onClose}
      closeOnBackdrop={!isSubmitting}
    >
      <form
        className="flex w-full flex-col gap-10 max-md:gap-[26px]"
        aria-busy={isSubmitting}
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col gap-8 max-md:gap-5">
          <RequestModalSummary request={request} />

          <div className="flex flex-col gap-4">
            <label
              className="text-[18px] font-semibold leading-[26px] text-[var(--black-300)] max-md:text-[16px]"
              htmlFor={priceId}
            >
              견적가를 입력해 주세요
            </label>

            <div className="relative">
              <input
                id={priceId}
                className="h-16 w-full rounded-2xl border border-[var(--line-200)] bg-[var(--gray-50)] py-[14px] pr-[54px] pl-[14px] text-[18px] font-normal leading-[26px] text-[var(--content-strong)] outline-none placeholder:text-[var(--content-placeholder)] focus:border-[var(--primary-400)] disabled:cursor-not-allowed disabled:bg-[var(--background-200)] max-md:h-[54px] max-md:pr-12 max-md:text-[16px]"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="견적가 입력"
                value={formattedPrice}
                disabled={isSubmitting}
                data-autofocus
                onChange={handlePriceChange}
              />

              <Image
                className="pointer-events-none absolute top-1/2 right-6 -translate-y-1/2 max-md:right-[14px]"
                src="/icons/mover-request/visibility-off.svg"
                alt=""
                width={24}
                height={24}
              />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <label
              className="text-[18px] font-semibold leading-[26px] text-[var(--black-300)] max-md:text-[16px]"
              htmlFor={commentId}
            >
              코멘트를 입력해 주세요
            </label>

            <textarea
              id={commentId}
              className="h-40 w-full resize-none overflow-y-auto rounded-2xl border border-[var(--line-200)] bg-[var(--gray-50)] px-6 py-[14px] text-[18px] font-normal leading-8 text-[var(--content-strong)] outline-none placeholder:text-[var(--content-placeholder)] focus:border-[var(--primary-400)] disabled:cursor-not-allowed disabled:bg-[var(--background-200)] max-md:px-4 max-md:text-[16px] max-md:leading-[26px]"
              placeholder="최소 10자 이상 입력해주세요"
              minLength={10}
              value={comment}
              disabled={isSubmitting}
              onChange={(event) => setComment(event.target.value)}
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
          {isSubmitting ? "전송 중..." : "견적 보내기"}
        </button>
      </form>
    </Modal>
  );
}
