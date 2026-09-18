"use client";

import {
  Suspense,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { MouseEvent as ReactMouseEvent, ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { MODAL_COMPONENTS } from "./modal-registry";

interface ModalNameOptions {
  /** 내용의 제목 요소 ID. 지정하면 ariaLabel보다 우선합니다. */
  ariaLabelledBy?: string;

  /** 제목 ID를 연결하지 않을 때 사용하는 구체적인 모달 이름입니다. */
  ariaLabel?: string;
}

interface ModalContextValue {
  isOpen: boolean;

  /**
   * JSX를 그대로 받아 state 기반 모달로 엽니다.
   *
   * 전달한 content가 제목과 닫기 버튼을 포함한 모달 내용을 책임집니다.
   * 새로고침하면 사라지는 폼, 확인창 등에 사용합니다.
   */
  openModal: (content: ReactNode, options?: ModalNameOptions) => void;

  /**
   * 모달을 즉시 닫습니다.
   *
   * Escape와 backdrop 닫기 정책과 관계없이 동작하기 때문에
   * mutation 성공 후 모달을 닫는 용도로 사용할 수 있습니다.
   */
  closeModal: () => void;

  /**
   * Escape와 backdrop을 통한 모달 닫기 허용 여부를 변경합니다.
   *
   * API 요청 중 false로 설정하면 사용자가 모달을 닫은 뒤
   * 동일 요청을 다시 제출하는 문제를 방지할 수 있습니다.
   */
  setModalDismissible: (isDismissible: boolean) => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

const FOCUSABLE_SELECTOR = [
  "button:not([disabled])",
  "a[href]",
  "input:not([disabled])",
  "textarea:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

interface BareModalProps extends ModalNameOptions {
  isOpen: boolean;
  children: ReactNode;

  /**
   * 사용자가 Escape 또는 backdrop으로 닫기를 요청했을 때 실행됩니다.
   *
   * 실제로 닫을 수 있는지는 ModalProvider에서 판단합니다.
   */
  onDismissRequest: () => void;
}

/**
 * 전역 모달 시스템의 최소 shell입니다.
 *
 * 담당:
 * - backdrop
 * - body 스크롤 잠금
 * - 포커스 이동과 복귀
 * - 포커스 트랩
 * - Escape/backdrop 닫기 요청 전달
 *
 * 제목, 닫기 버튼, 폼과 같은 실제 콘텐츠는 children이 담당합니다.
 */
function BareModal({
  isOpen,
  onDismissRequest,
  children,
  ariaLabel,
  ariaLabelledBy,
}: BareModalProps) {
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

    (firstFocusableElement ?? dialog)?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();

        // 실제 닫기 가능 여부는 Provider의 dismissal 정책이 결정합니다.
        onDismissRequest();
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
  }, [isOpen, onDismissRequest]);

  if (!isOpen) {
    return null;
  }

  const handleBackdropMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onDismissRequest();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-[rgb(17_17_17/72%)] p-6"
      onMouseDown={handleBackdropMouseDown}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledBy}
        aria-label={ariaLabelledBy ? undefined : ariaLabel || "알림"}
        tabIndex={-1}
        className="box-border max-h-[calc(100dvh-48px)] overflow-y-auto rounded-[32px] bg-(--gray-50) outline-none"
      >
        {children}
      </div>
    </div>
  );
}

/**
 * URL의 ?modal= 쿼리를 읽어 modal-registry에 등록된 모달을 엽니다.
 *
 * URL 기반 모달은 현재 state 기반 폼 모달의 제출 상태와 독립적으로 동작합니다.
 */
function UrlModal() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const modalName = searchParams.get("modal");
  const ModalComponent = modalName ? MODAL_COMPONENTS[modalName] : undefined;

  const closeModal = useCallback(() => {
    const params = new URLSearchParams(searchParams);

    params.delete("modal");

    const query = params.toString();

    // 모달을 여러 번 열고 닫아도 불필요한 브라우저 히스토리가
    // 쌓이지 않도록 push 대신 replace를 사용합니다.
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }, [pathname, router, searchParams]);

  if (!ModalComponent) {
    return null;
  }

  return (
    <BareModal isOpen onDismissRequest={closeModal}>
      <ModalComponent onClose={closeModal} />
    </BareModal>
  );
}

/**
 * 애플리케이션 전역 모달 시스템입니다.
 *
 * state 기반 모달:
 * - useModal().openModal(content)
 * - 폼, 확인창처럼 새로고침 유지가 필요 없는 모달
 *
 * URL 기반 모달:
 * - ?modal=이름
 * - modal-registry에 등록된 모달
 */
export function ModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [modalContent, setModalContent] = useState<ReactNode>(null);
  const [modalName, setModalName] = useState<ModalNameOptions>({});

  /**
   * Escape와 backdrop으로 state 기반 모달을 닫을 수 있는지를 관리합니다.
   *
   * 새 모달은 항상 닫을 수 있는 상태로 시작합니다.
   */
  const [isModalDismissible, setModalDismissible] = useState(true);

  const openModal = useCallback(
    (content: ReactNode, options: ModalNameOptions = {}) => {
      setModalContent(content);
      setModalName(options);
      setModalDismissible(true);
      setIsOpen(true);
    },
    [],
  );

  /**
   * mutation 성공처럼 애플리케이션이 명시적으로 닫는 경우에는
   * dismissal 제한과 관계없이 모달을 닫습니다.
   */
  const closeModal = useCallback(() => {
    setIsOpen(false);
    setModalContent(null);
    setModalName({});
    setModalDismissible(true);
  }, []);

  /**
   * Escape와 backdrop에서만 사용하는 닫기 요청 handler입니다.
   *
   * API 요청 중에는 isModalDismissible이 false이므로 닫히지 않습니다.
   */
  const handleDismissRequest = useCallback(() => {
    if (!isModalDismissible) {
      return;
    }

    closeModal();
  }, [closeModal, isModalDismissible]);

  return (
    <ModalContext.Provider
      value={{
        isOpen,
        openModal,
        closeModal,
        setModalDismissible,
      }}
    >
      {children}

      <BareModal
        isOpen={isOpen}
        onDismissRequest={handleDismissRequest}
        {...modalName}
      >
        {modalContent}
      </BareModal>

      <Suspense fallback={null}>
        <UrlModal />
      </Suspense>
    </ModalContext.Provider>
  );
}

/**
 * ModalProvider 하위에서만 사용할 수 있는 전역 모달 hook입니다.
 */
export function useModal(): ModalContextValue {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error("useModal은 ModalProvider 안에서만 사용할 수 있습니다.");
  }

  return context;
}
