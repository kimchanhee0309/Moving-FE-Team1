"use client";

import { Suspense, createContext, useContext, useEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent, ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { MODAL_COMPONENTS } from "./modal-registry";

interface ModalContextValue {
  isOpen: boolean;
  /**
   * JSX를 그대로 받아 모달로 띄운다(state 기반). 넘긴 `content`가 제목·닫기 버튼까지 전부
   * 책임진다. 새로고침하면 사라진다 — 확인창, 폼 입력처럼 공유/재접속이 필요 없는 모달에 쓴다.
   */
  openModal: (content: ReactNode) => void;
  closeModal: () => void;
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

/**
 * 전역 모달 시스템 전용 최소 모달 shell입니다. 제목/닫기 버튼 같은 chrome이 없고 배경 딤,
 * 포커스 트랩, Esc/backdrop 닫기, 열려 있는 동안 body 스크롤 잠금만 책임집니다 — 넘겨받은
 * `children`이 모달 내용 전체(제목, 닫기 버튼 포함)를 직접 그립니다.
 *
 * 너비/높이를 강제하지 않는다 — dialog wrapper에 `w-*`/`max-w-*`가 없어 `children`이 자기
 * 크기를 그대로 정한다. 작은 확인창은 아무 너비도 안 주면 내용 크기만큼만 좁게 나오고, 화면을
 * 절반만 덮는 모달은 `className="w-[50vw]"`, 꽉 차는 모달은 `className="w-[calc(100vw-48px)]"`
 * 처럼 content 최상위 요소에 원하는 너비를 직접 주면 된다(`max-h-[calc(100dvh-48px)]`만 항상
 * 유지되어 뷰포트를 넘치지 않는다).
 *
 * `src/common/components/MoverModal/Modal.tsx`(다른 feature들이 쓰는 title 필수 모달)와는
 * 별개입니다 — 그 컴포넌트를 수정하거나 재사용하지 않고, 전역 모달 전용으로 여기서만 씁니다.
 */
function BareModal({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previouslyFocusedElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const dialog = dialogRef.current;
    const firstFocusableElement = dialog?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    (firstFocusableElement ?? dialog)?.focus();

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

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-[rgb(17_17_17/72%)] p-6"
      onMouseDown={handleBackdropMouseDown}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className="box-border max-h-[calc(100dvh-48px)] overflow-y-auto rounded-[32px] bg-(--gray-50) outline-none"
      >
        {children}
      </div>
    </div>
  );
}

/**
 * URL의 `?modal=` 쿼리를 읽어 `MODAL_COMPONENTS`(modal-registry)에 등록된 컴포넌트를 연다.
 * `useSearchParams`를 쓰므로 `ModalProvider`에서 `Suspense`로 감싼다.
 *
 * state 기반 모달(`openModal`)과 이 URL 기반 모달은 서로 독립적으로 동작한다 — 동시에 둘 다
 * 열려 있는 상태도 기술적으로는 가능하니, 한 트리거에서 두 방식을 같이 쓰지 않는다.
 */
function UrlModal() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const modalName = searchParams.get("modal");
  const ModalComponent = modalName ? MODAL_COMPONENTS[modalName] : undefined;

  const closeModal = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("modal");
    const query = params.toString();
    // 뒤로가기 히스토리를 쌓지 않도록 push 대신 replace를 쓴다 — 그래야 모달을 여러 번 여닫아도
    // 뒤로가기 한 번에 모달이 열려 있던 이전 페이지로 튀지 않는다.
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  if (!ModalComponent) {
    return null;
  }

  return (
    <BareModal isOpen onClose={closeModal}>
      <ModalComponent onClose={closeModal} />
    </BareModal>
  );
}

/**
 * 전역 모달 시스템입니다. 두 가지 방식을 함께 제공하며, 상황에 맞는 쪽을 선택해서 씁니다.
 *
 * 1. state 기반(`useModal().openModal(content)`): 컴포넌트가 JSX를 직접 넘겨서 연다.
 *    새로고침하면 닫힌다 — 확인창, 폼 입력처럼 공유/재접속이 필요 없는 모달에 쓴다.
 * 2. URL 기반(`<Link href="?modal=이름">`): `modal-registry.ts`(`MODAL_COMPONENTS`)에 등록된
 *    컴포넌트를 `?modal=이름` 쿼리로 연다. 새로고침·링크 공유 후에도 같은 모달이 열린 채로
 *    유지돼야 하는 경우에만 쓴다(AGENTS.md 어디에도 아직 이런 요구가 없어 registry는 비어 있다).
 *
 * 두 방식 모두 배경 딤/포커스 트랩/Esc·backdrop 닫기만 책임지는 `BareModal`(이 파일 전용, 아래
 * 정의)을 쓴다 — 다른 feature들이 쓰는 `MoverModal/Modal.tsx`(title 필수)는 건드리지 않는다.
 */
export function ModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [modalContent, setModalContent] = useState<ReactNode>(null);

  const openModal = (content: ReactNode) => {
    setModalContent(content);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setModalContent(null);
  };

  return (
    <ModalContext.Provider value={{ isOpen, openModal, closeModal }}>
      {children}

      <BareModal isOpen={isOpen} onClose={closeModal}>
        {modalContent}
      </BareModal>

      <Suspense fallback={null}>
        <UrlModal />
      </Suspense>
    </ModalContext.Provider>
  );
}

/**
 * `ModalProvider` 하위에서만 호출할 수 있다. `Providers`(src/providers/index.tsx)가 루트
 * layout에서 이미 감싸고 있으므로 일반적으로는 항상 사용 가능하다.
 *
 * @example
 * function MyComponent() {
 *   const { openModal, closeModal } = useModal();
 *
 *   const handleClick = () => {
 *     openModal(
 *       <div>
 *         <h2>제목</h2>
 *         <p>내용</p>
 *         <button onClick={closeModal}>닫기</button>
 *       </div>
 *     );
 *   };
 *
 *   return <button onClick={handleClick}>모달 열기</button>;
 * }
 */
export function useModal(): ModalContextValue {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error("useModal은 ModalProvider 안에서만 사용할 수 있습니다.");
  }

  return context;
}
