"use client";

import Image from "next/image";
import { useEffect, useId, useRef } from "react";
import type { MouseEvent, PropsWithChildren } from "react";

interface ModalProps extends PropsWithChildren {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  closeOnBackdrop?: boolean;
  mobileLayout?: "bottom-sheet" | "centered";
}

const FOCUSABLE_SELECTOR = [
  "button:not([disabled])",
  "a[href]",
  "input:not([disabled])",
  "textarea:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export function Modal({
  isOpen,
  title,
  onClose,
  closeOnBackdrop = true,
  mobileLayout = "bottom-sheet",
  children,
}: ModalProps) {
  const isBottomSheet = mobileLayout === "bottom-sheet";
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previouslyFocusedElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const dialog = dialogRef.current;

    const autofocusElement =
      dialog?.querySelector<HTMLElement>("[data-autofocus]");

    const firstFocusableElement =
      dialog?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);

    (autofocusElement ?? firstFocusableElement ?? dialog)?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !dialog) {
        return;
      }

      const focusableElements = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );

      if (focusableElements.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }

      if (!event.shiftKey && document.activeElement === lastElement) {
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

  const handleBackdropMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdrop && event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className={[
        "fixed inset-0 z-[1000] flex items-center justify-center bg-[rgb(17_17_17/72%)] p-6",
        isBottomSheet && "max-md:items-end max-md:p-0",
      ]
        .filter(Boolean)
        .join(" ")}
      onMouseDown={handleBackdropMouseDown}
    >
      <div
        ref={dialogRef}
        className={[
          "box-border flex max-h-[calc(100dvh-48px)] w-full max-w-[608px] flex-col gap-10 overflow-y-auto rounded-[32px] bg-[var(--gray-50)] px-6 pt-8 pb-10 shadow-[4px_4px_5px_rgb(169_169_169/20%)] outline-none",
          "max-md:max-w-[375px] max-md:gap-[26px]",
          isBottomSheet &&
            "max-md:max-h-dvh max-md:rounded-t-[32px] max-md:rounded-b-none",
        ]
          .filter(Boolean)
          .join(" ")}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <header className="flex items-center justify-between">
          <h2
            id={titleId}
            className="text-[24px] font-semibold leading-8 text-[var(--content-strong)] max-md:text-[18px] max-md:font-bold max-md:leading-[26px]"
          >
            {title}
          </h2>

          <button
            type="button"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg hover:bg-[var(--gray-100)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-400)] max-md:size-6"
            aria-label={`${title} 닫기`}
            onClick={onClose}
          >
            <Image
              className="size-full"
              src="/icons/mover-request/close.svg"
              alt=""
              width={36}
              height={36}
            />
          </button>
        </header>

        {children}
      </div>
    </div>
  );
}
