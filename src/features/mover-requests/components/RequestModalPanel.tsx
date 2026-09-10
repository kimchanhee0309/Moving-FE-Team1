"use client";

import Image from "next/image";
import type { ReactNode } from "react";

interface RequestModalPanelProps {
  title: string;
  children: ReactNode;
  isSubmitting?: boolean;
  onClose: () => void;
}

export function RequestModalPanel({
  title,
  children,
  isSubmitting = false,
  onClose,
}: RequestModalPanelProps) {
  return (
    <section
      className={[
        "box-border flex w-[608px] max-w-[calc(100vw-48px)] flex-col gap-10",
        "rounded-[32px] bg-[var(--gray-50)] px-6 pt-8 pb-10",
        "shadow-[4px_4px_5px_rgb(169_169_169/20%)]",
        "max-[743px]:w-[327px] max-[743px]:gap-[26px]",
      ].join(" ")}
      aria-busy={isSubmitting || undefined}
    >
      <header className="flex items-center justify-between gap-4">
        <h2 className="text-[24px] font-semibold leading-8 text-[var(--content-strong)] max-[743px]:text-[18px] max-[743px]:font-bold max-[743px]:leading-[26px]">
          {title}
        </h2>

        <button
          type="button"
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg hover:bg-[var(--gray-100)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-400)] disabled:cursor-not-allowed disabled:opacity-50 max-[743px]:size-6"
          aria-label={`${title} 닫기`}
          disabled={isSubmitting}
          onClick={onClose}
        >
          <Image
            src="/icons/mover-request/close.svg"
            alt=""
            width={36}
            height={36}
          />
        </button>
      </header>

      {children}
    </section>
  );
}
