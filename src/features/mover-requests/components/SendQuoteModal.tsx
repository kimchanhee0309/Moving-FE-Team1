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
import styles from "./MoverRequests.module.css";

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
        className={styles.modalForm}
        aria-busy={isSubmitting}
        onSubmit={handleSubmit}
      >
        <div className={styles.modalBody}>
          <RequestModalSummary request={request} />

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor={priceId}>
              견적가를 입력해 주세요
            </label>

            <div className={styles.inputContainer}>
              <input
                id={priceId}
                className={styles.priceInput}
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
                className={styles.inputIcon}
                src="/icons/mover-request/visibility-off.svg"
                alt=""
                width={24}
                height={24}
              />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor={commentId}>
              코멘트를 입력해 주세요
            </label>

            <textarea
              id={commentId}
              className={styles.textarea}
              placeholder="최소 10자 이상 입력해주세요"
              minLength={10}
              value={comment}
              disabled={isSubmitting}
              onChange={(event) => setComment(event.target.value)}
            />
          </div>

          {serverError && (
            <p className={styles.formError} role="alert">
              {serverError}
            </p>
          )}
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={!canSubmit}
        >
          {isSubmitting ? "전송 중..." : "견적 보내기"}
        </button>
      </form>
    </Modal>
  );
}
