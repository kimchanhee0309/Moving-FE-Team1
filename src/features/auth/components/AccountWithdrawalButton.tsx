"use client";

import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { createPortal } from "react-dom";

import { ApiError } from "@/common/api/error";
import {
  getCurrentPasswordMismatchError,
} from "@/common/api/get-error-message";
import { useApiErrorMessage } from "@/common/api/useApiErrorMessage";
import { Button } from "@/common/components/button";
import { Input } from "@/common/components/Input";
import { Modal } from "@/common/components/MoverModal/Modal";
import { useValidationMessage } from "@/common/validation/useValidationMessage";

import { useAuth } from "../hooks/useAuth";

interface AccountWithdrawalButtonProps {
  /** 프로필 저장 중에는 서로 다른 계정 변경 요청이 겹치지 않도록 탈퇴 진입을 막습니다. */
  disabled?: boolean;
  /** 프로필 화면의 기존 버튼 영역 안에서 보조 액션 위치를 맞춥니다. */
  className?: string;
  /** 일반·기사 프로필의 반응형 버튼 높이를 기존 취소·수정 버튼과 맞춥니다. */
  buttonClassName?: string;
}

/** 일반 사용자와 기사 설정 화면에서 같은 탈퇴 확인·재인증·오류 흐름을 제공합니다. */
export function AccountWithdrawalButton({
  disabled = false,
  className = "",
  buttonClassName = "",
}: AccountWithdrawalButtonProps) {
  const t = useTranslations("Withdrawal");
  const apiErrorMessage = useApiErrorMessage();
  const translateValidation = useValidationMessage();
  const { withdrawal } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");

  const closeModal = () => {
    if (withdrawal.isPending) return;
    setIsOpen(false);
    setCurrentPassword("");
    withdrawal.reset();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (withdrawal.isPending) return;

    try {
      await withdrawal.mutateAsync(currentPassword);
    } catch {
      // mutation 오류는 현재 비밀번호 필드 또는 공통 서버 오류 문구로 표시합니다.
    }
  };

  const currentPasswordError =
    translateValidation(getCurrentPasswordMismatchError(withdrawal.error)) ??
    (withdrawal.error instanceof ApiError && withdrawal.error.code === "CURRENT_PASSWORD_REQUIRED"
      ? apiErrorMessage(withdrawal.error, t("error"))
      : undefined);
  const submissionError =
    withdrawal.error && !currentPasswordError
      ? apiErrorMessage(withdrawal.error, t("error"))
      : undefined;

  return (
    <div className={className}>
      <Button
        type="button"
        variant="outlined"
        fullWidth
        disabled={disabled}
        className={`border-[var(--primary-400)]! bg-transparent! text-[var(--primary-400)]! shadow-none! enabled:hover:border-[#e04829]! enabled:hover:bg-[#e04829]! enabled:hover:text-[var(--gray-50)]! ${buttonClassName}`}
        onClick={() => {
          withdrawal.reset();
          setIsOpen(true);
        }}
      >
        {t("title")}
      </Button>

      {isOpen && typeof document !== "undefined" ? createPortal(<Modal
        isOpen={isOpen}
        title={t("title")}
        mobileLayout="centered"
        closeOnBackdrop={!withdrawal.isPending}
        onClose={closeModal}
      >
        <form
          noValidate
          aria-busy={withdrawal.isPending}
          className="flex flex-col gap-6"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-2 text-[var(--black-300)]">
            <p className="text-lg-semibold">{t("description")}</p>
            <p className="text-sm-regular text-[var(--gray-500)]">
              {t("hint")}
            </p>
          </div>

          <Input
            data-autofocus
            name="withdrawalCurrentPassword"
            label={t("password")}
            type="password"
            autoComplete="current-password"
            placeholder={t("passwordPlaceholder")}
            value={currentPassword}
            error={currentPasswordError}
            helperText={t("socialHint")}
            disabled={withdrawal.isPending}
            containerClassName="max-w-none"
            onChange={(event) => {
              setCurrentPassword(event.currentTarget.value);
              withdrawal.reset();
            }}
          />

          {submissionError ? (
            <p
              role="alert"
              className="text-sm-medium rounded-xl bg-[var(--secondary-red-100)] px-4 py-3 text-[var(--secondary-red-200)]"
            >
              {submissionError}
            </p>
          ) : null}

          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outlined"
              fullWidth
              disabled={withdrawal.isPending}
              onClick={closeModal}
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              fullWidth
              isLoading={withdrawal.isPending}
              className="enabled:bg-[var(--secondary-red-200)]! enabled:hover:bg-[var(--secondary-red-200)]!"
            >
              {t("submit")}
            </Button>
          </div>
        </form>
      </Modal>, document.body) : null}
    </div>
  );
}
