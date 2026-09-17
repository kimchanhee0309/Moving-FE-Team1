"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState, type ChangeEvent } from "react";

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

interface ProfileImageInputProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  onValidationErrorChange?: (error: string | null) => void;
  initialImageUrl?: string | null;
  error?: string;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
}

/**
 * customer/mover 프로필 폼이 공유하는 단일 이미지 입력입니다.
 * 브라우저에서는 미리보기만 만들며 multipart FormData 구성과 업로드 요청은 feature API 계층이 담당합니다.
 */
export function ProfileImageInput({
  file,
  onFileChange,
  onValidationErrorChange,
  initialImageUrl,
  error,
  disabled = false,
  isLoading = false,
  className,
}: ProfileImageInputProps) {
  const inputId = useId();
  const messageId = `${inputId}-message`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedPreviewUrl, setSelectedPreviewUrl] = useState<string>();
  const [fileTypeError, setFileTypeError] = useState("");
  const isInteractionDisabled = disabled || isLoading;
  const message = error ?? fileTypeError;
  const previewUrl = file ? selectedPreviewUrl : initialImageUrl;

  useEffect(() => {
    // object URL은 선택 파일을 외부로 전송하지 않는 로컬 미리보기이며, 교체·unmount 때 즉시 해제합니다.
    return () => {
      if (selectedPreviewUrl) URL.revokeObjectURL(selectedPreviewUrl);
    };
  }, [selectedPreviewUrl]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.currentTarget.files?.[0] ?? null;

    if (selectedFile && !ALLOWED_IMAGE_TYPES.has(selectedFile.type)) {
      const validationError = "JPG, PNG, WebP 이미지만 선택해 주세요.";
      setFileTypeError(validationError);
      onValidationErrorChange?.(validationError);
      setSelectedPreviewUrl(undefined);
      onFileChange(null);
      event.currentTarget.value = "";
      return;
    }

    if (selectedFile && selectedFile.size > MAX_IMAGE_SIZE_BYTES) {
      const validationError = "프로필 이미지는 5MB 이하여야 합니다.";
      setFileTypeError(validationError);
      onValidationErrorChange?.(validationError);
      setSelectedPreviewUrl(undefined);
      onFileChange(null);
      event.currentTarget.value = "";
      return;
    }

    setFileTypeError("");
    onValidationErrorChange?.(null);
    setSelectedPreviewUrl(selectedFile ? URL.createObjectURL(selectedFile) : undefined);
    onFileChange(selectedFile);
  };

  const clearSelectedFile = () => {
    if (inputRef.current) inputRef.current.value = "";
    setFileTypeError("");
    setSelectedPreviewUrl(undefined);
    onValidationErrorChange?.(null);
    onFileChange(null);
  };

  return (
    <div className={["flex flex-col gap-4", className].filter(Boolean).join(" ")}>
      <span className="text-lg-semibold text-[var(--black-300)] min-[1200px]:!text-[20px] min-[1200px]:!leading-[32px] min-[1200px]:!font-semibold">프로필 이미지</span>
      <label
        htmlFor={inputId}
        className={`relative flex size-[100px] items-center justify-center overflow-hidden rounded-md ${previewUrl ? "bg-[var(--black-400)]" : "bg-[var(--background-200)]"} transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--primary-400)] min-[1200px]:size-[160px] ${
          isInteractionDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-[var(--background-300)]"
        }`}
      >
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt="선택한 프로필 이미지 미리보기"
            fill
            sizes="(min-width: 1200px) 160px, 100px"
            className="scale-110 object-cover"
            unoptimized={previewUrl.startsWith("blob:") || /^https?:\/\//.test(previewUrl)}
          />
        ) : (
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            aria-hidden="true"
            className="text-[var(--gray-400)]"
          >
            <rect x="10" y="11" width="28" height="26" rx="5" stroke="currentColor" strokeWidth="2.5" />
            <circle cx="29" cy="19" r="3" stroke="currentColor" strokeWidth="2.5" />
            <path d="M12 32l8-8 6 6 4-4 6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          disabled={isInteractionDisabled}
          aria-describedby={message ? messageId : undefined}
          aria-invalid={Boolean(message) || undefined}
          onChange={handleChange}
        />
      </label>
      {message ? (
        <p id={messageId} role="alert" className="text-xs-medium text-[var(--primary-400)]">
          {message}
        </p>
      ) : null}
      {file || fileTypeError ? (
        <button
          type="button"
          className="w-fit text-xs-medium text-[var(--gray-500)] underline underline-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isInteractionDisabled}
          onClick={clearSelectedFile}
        >
          이미지 선택 취소
        </button>
      ) : null}
    </div>
  );
}
