"use client";

import { useEffect, useId, useRef } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";

import { AddressCard } from "@/common/components/AddressCard";

import { ClearCircleIcon, CloseIcon, SearchIcon } from "./icons";
import type { AddressResult, AddressSearchModalProps } from "./AddressSearchModal.types";

const FOCUS_RING =
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--black-400)";

const FOCUSABLE_SELECTOR = [
  "button:not([disabled])",
  "a[href]",
  "input:not([disabled])",
  "textarea:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function addressKey(address: AddressResult) {
  return `${address.zonecode}-${address.roadAddress}-${address.jibunAddress}`;
}

/**
 * Figma의 `Component/address-card`(모달) 컴포넌트를 구현한 공통 검색 모달입니다.
 * 이름과 달리 카카오 우편번호 API를 직접 호출하지 않습니다 — 검색어 입력과 결과
 * 렌더링만 담당하는 "껍데기 UI"이며, 실제 검색 로직은 항상 부모(추후 adapter/hook)가
 * `results`/`isLoading` props로 채워 넣습니다.
 *
 * 접근성: 열릴 때 검색 input으로 포커스를 이동하고 Tab 포커스를 내부로 가두며,
 * Esc와 backdrop 클릭으로 닫을 수 있고 닫힐 때 이전 포커스로 복귀합니다.
 *
 * 크기(Figma의 sm/md variant)는 AddressCard와 동일하게 Tailwind `sm:` breakpoint(640px)를
 * 기준으로 전환됩니다. `sm`은 모바일 팝업 화면(node 1:4815) 전용 사이즈이고 `md`는 태블릿/데스크톱이
 * 함께 쓰는 사이즈임을 실제 모바일 화면 목업으로 확인했다 — 640px 미만(모바일)만 sm 레이아웃을,
 * 640px 이상(태블릿+데스크톱)은 md 레이아웃을 사용합니다.
 */
export function AddressSearchModal({
  isOpen,
  title,
  searchValue,
  onSearchChange,
  onSearchClear,
  results,
  isLoading = false,
  selectedAddress,
  onSelectAddress,
  onConfirm,
  onClose,
  searchPlaceholder = "텍스트를 입력해 주세요.",
  className = "",
}: AddressSearchModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previouslyFocusedElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    searchInputRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const dialog = dialogRef.current;
      if (!dialog) {
        return;
      }

      const focusableElements = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );

      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocusedElement?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleBackdropMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const hasQuery = searchValue.trim().length > 0;
  const showEmptyMessage = !isLoading && hasQuery && results.length === 0;
  const showHint = !isLoading && !hasQuery && results.length === 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={handleBackdropMouseDown}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`flex w-full max-w-[260px] flex-col gap-[30px] rounded-[24px] bg-(--gray-50) px-4 py-6 sm:max-w-[560px] sm:gap-10 sm:rounded-[32px] sm:px-6 sm:pt-8 sm:pb-10 ${FOCUS_RING} ${className}`}
      >
        <div className="flex w-full items-center justify-between">
          <h2 id={titleId} className="text-2lg-bold text-(--black-400) sm:text-2xl-semibold">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={`${title} 닫기`}
            className={`flex size-6 shrink-0 items-center justify-center text-(--gray-400)! sm:size-9 ${FOCUS_RING}`}
          >
            <CloseIcon className="size-full" />
          </button>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex w-full items-center gap-3 rounded-2xl bg-(--background-100) px-4 py-3.5 sm:h-16 sm:gap-4 sm:px-6">
            <input
              ref={searchInputRef}
              type="search"
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={searchPlaceholder}
              aria-label={title}
              className="text-2lg-regular min-w-0 flex-1 appearance-none bg-transparent text-(--black-400)! outline-none placeholder:text-(--gray-300) [&::-webkit-search-cancel-button]:appearance-none"
            />
            {searchValue.length > 0 ? (
              <button
                type="button"
                onClick={onSearchClear}
                aria-label="검색어 지우기"
                className={`flex size-6 shrink-0 items-center justify-center text-(--gray-400)! sm:size-9 ${FOCUS_RING}`}
              >
                <ClearCircleIcon className="size-full" />
              </button>
            ) : null}
            <span
              aria-hidden="true"
              className="flex size-6 shrink-0 items-center justify-center text-(--gray-400) sm:size-9"
            >
              <SearchIcon className="size-full" />
            </span>
          </div>

          <div
            role="group"
            aria-label="주소 검색 결과"
            className="flex max-h-[280px] flex-col gap-4 overflow-y-auto"
          >
            {isLoading ? (
              <p className="text-md-regular px-1 py-6 text-center text-(--gray-400)">
                검색하고 있어요...
              </p>
            ) : null}

            {showHint ? (
              <p className="text-md-regular px-1 py-6 text-center text-(--gray-400)">
                우편번호, 도로명 또는 지번 주소로 검색해 주세요.
              </p>
            ) : null}

            {showEmptyMessage ? (
              <p className="text-md-regular px-1 py-6 text-center text-(--gray-400)">
                검색 결과가 없어요. 다른 주소로 검색해 보세요.
              </p>
            ) : null}

            {!isLoading &&
              results.map((address) => (
                <AddressCard
                  key={addressKey(address)}
                  address={address}
                  selected={
                    selectedAddress !== null && addressKey(selectedAddress) === addressKey(address)
                  }
                  onSelect={onSelectAddress}
                />
              ))}
          </div>
        </div>

        <button
          type="button"
          disabled={!selectedAddress}
          onClick={() => {
            if (selectedAddress) {
              onConfirm(selectedAddress);
            }
          }}
          className={`text-lg-semibold sm:text-2lg-semibold flex h-[54px] w-full items-center justify-center rounded-xl text-center text-(--gray-50)! transition-colors sm:h-16 sm:rounded-2xl ${
            selectedAddress ? "bg-(--primary-400)!" : "cursor-not-allowed bg-(--gray-300)!"
          } ${FOCUS_RING}`}
        >
          선택완료
        </button>
      </div>
    </div>
  );
}
