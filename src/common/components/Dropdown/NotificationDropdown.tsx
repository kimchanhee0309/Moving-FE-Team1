"use client";

import type { ReactNode } from "react";

import { CloseIcon, LoadingSpinner } from "./DropdownIcons";
import type { DropdownSize } from "./dropdown.types";
import { useDropdown } from "./useDropdown";

export interface NotificationDropdownItem {
  id: string;
  title: string;
  highlightedTexts?: readonly string[];
  description?: string;
  createdAt: string;
  isRead?: boolean;
  onSelect?: () => void;
}

export interface NotificationDropdownProps {
  trigger: ReactNode;
  items: readonly NotificationDropdownItem[];
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  size?: DropdownSize;
  isLoading?: boolean;
  error?: string;
  emptyMessage?: string;
  triggerAriaLabel?: string;
  align?: "left" | "right";
  className?: string;
}

/**
 * GNB 알림 버튼에 연결하는 Figma sm/md 패널이다.
 * 서버 데이터 상태를 만들지 않고 전달받은 로딩·오류·빈 목록만 시각화한다.
 */
export function NotificationDropdown({
  trigger,
  items,
  isOpen,
  onOpenChange,
  size = "md",
  isLoading = false,
  error,
  emptyMessage = "새로운 알림이 없습니다.",
  triggerAriaLabel = "알림 열기",
  align = "right",
  className,
}: NotificationDropdownProps) {
  const { menuId, rootRef, toggle, triggerRef } = useDropdown({
    isOpen,
    onOpenChange,
  });

  const handleItemSelect = (item: NotificationDropdownItem) => {
    item.onSelect?.();
    onOpenChange(false);
  };

  return (
    <div
      className={["relative inline-flex", className].filter(Boolean).join(" ")}
      ref={rootRef}
    >
      <button
        aria-controls={menuId}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={triggerAriaLabel}
        className="rounded-full outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-300)]"
        onClick={toggle}
        ref={triggerRef}
        type="button"
      >
        {trigger}
      </button>

      {isOpen ? (
        <section
          aria-label="알림"
          className={[
            "absolute top-full z-30 mt-2 flex flex-col overflow-hidden rounded-3xl border border-[var(--line-200)] bg-[var(--gray-50)] px-4 py-2.5 shadow-[2px_2px_16px_rgba(0,0,0,0.06)]",
            align === "right" ? "right-0" : "left-0",
            size === "sm" ? "h-[294px] w-[280px]" : "h-[332px] w-[327px]",
          ].join(" ")}
          id={menuId}
          role="dialog"
        >
          <header className="flex items-center justify-between px-2 py-1.5">
            <h2 className="text-lg-semibold text-[var(--black-500)]">알림</h2>
            <button
              aria-label="알림 닫기"
              className="rounded-md !text-[var(--black-400)] outline-none hover:!bg-[var(--gray-100)] focus-visible:outline-2 focus-visible:outline-[var(--primary-300)]"
              onClick={() => onOpenChange(false)}
              type="button"
            >
              <CloseIcon className="size-6" />
            </button>
          </header>

          <div
            aria-busy={isLoading}
            className="min-h-0 flex-1 overflow-y-auto"
          >
            {isLoading ? (
              <div className="text-md-medium flex min-h-32 items-center justify-center gap-2 text-[var(--gray-500)]">
                <LoadingSpinner className="size-5" />
                알림을 불러오는 중입니다.
              </div>
            ) : error ? (
              <p className="text-md-medium flex min-h-32 items-center justify-center px-4 text-center text-[var(--primary-400)]">
                {error}
              </p>
            ) : items.length === 0 ? (
              <p className="text-md-medium flex min-h-32 items-center justify-center px-4 text-center text-[var(--gray-500)]">
                {emptyMessage}
              </p>
            ) : (
              <ul>
                {items.map((item) => (
                  <li
                    className="border-b border-[var(--line-200)] last:border-b-0"
                    key={item.id}
                  >
                    <button
                      className={[
                        "flex w-full flex-col items-start gap-0.5 !px-6 !py-4 text-left outline-none transition-colors",
                        "hover:!bg-[var(--gray-100)] focus-visible:!bg-[var(--gray-100)]",
                        item.isRead ? "opacity-70" : "",
                      ].join(" ")}
                      onClick={() => handleItemSelect(item)}
                      type="button"
                    >
                      <span className="text-lg-medium text-[var(--black-400)]">
                        {renderHighlightedText(
                          item.title,
                          item.highlightedTexts,
                        )}
                      </span>
                      {item.description ? (
                        <span className="text-xs-regular text-[var(--gray-500)]">
                          {item.description}
                        </span>
                      ) : null}
                      <span className="text-xs-regular text-[var(--gray-400)]">
                        {item.createdAt}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}

interface NotificationTextPart {
  text: string;
  isHighlighted: boolean;
}

/** API 문장을 그대로 유지하면서 Figma에서 강조한 동적 정보만 색상 토큰으로 표시한다. */
function renderHighlightedText(
  text: string,
  highlightedTexts: readonly string[] | undefined,
) {
  const targets = highlightedTexts?.filter(Boolean) ?? [];

  if (targets.length === 0) {
    return text;
  }

  const parts: NotificationTextPart[] = [];
  let cursor = 0;

  while (cursor < text.length) {
    let nextIndex = -1;
    let nextTarget = "";

    targets.forEach((target) => {
      const targetIndex = text.indexOf(target, cursor);

      if (
        targetIndex !== -1 &&
        (nextIndex === -1 || targetIndex < nextIndex)
      ) {
        nextIndex = targetIndex;
        nextTarget = target;
      }
    });

    if (nextIndex === -1) {
      parts.push({ text: text.slice(cursor), isHighlighted: false });
      break;
    }

    if (nextIndex > cursor) {
      parts.push({
        text: text.slice(cursor, nextIndex),
        isHighlighted: false,
      });
    }

    parts.push({ text: nextTarget, isHighlighted: true });
    cursor = nextIndex + nextTarget.length;
  }

  return parts.map((part, index) => (
    <span
      className={
        part.isHighlighted ? "text-[var(--primary-400)]" : undefined
      }
      key={`${part.text}-${index}`}
    >
      {part.text}
    </span>
  ));
}
