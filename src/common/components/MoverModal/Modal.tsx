"use client";

import { useEffect, useId, useRef } from "react";
import type { MouseEvent, PropsWithChildren } from "react";
import styles from "./Modal.module.css";

interface ModalProps extends PropsWithChildren {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  closeOnBackdrop?: boolean;
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
  children,
}: ModalProps) {
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

    const firstFocusableElement =
      dialog?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);

    firstFocusableElement?.focus();
  });
}
