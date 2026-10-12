"use client";

import { useEffect, useId, useRef } from "react";

interface UseDropdownParams {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  disabled?: boolean;
}

export function useDropdown({
  isOpen,
  onOpenChange,
  disabled = false,
}: UseDropdownParams) {
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    // 포인터 종류와 관계없이 바깥 영역을 누르면 열린 메뉴를 닫는다.
    const handlePointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Node)) {
        return;
      }

      if (!rootRef.current?.contains(event.target)) {
        onOpenChange(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      onOpenChange(false);
      triggerRef.current?.focus();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onOpenChange]);

  const toggle = () => {
    if (!disabled) {
      onOpenChange(!isOpen);
    }
  };

  const closeAndRestoreFocus = () => {
    onOpenChange(false);
    triggerRef.current?.focus();
  };

  return {
    closeAndRestoreFocus,
    menuId,
    rootRef,
    toggle,
    triggerRef,
  };
}

