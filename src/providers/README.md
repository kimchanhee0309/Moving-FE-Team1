# Providers

루트는 `QueryProvider → AuthProvider → ModalProvider`로 구성합니다. 인증 Query·이메일 mutation·로그아웃·화면 인가 판정은 `AuthProvider.tsx` 한 곳에서 소유합니다. 사용자 사본을 Context state에 따로 저장하지 않습니다. 모달 안에서도 `@/common/auth/AuthContext`의 `useAuth`로 같은 전역 인증 상태와 명령을 소비할 수 있습니다.

Provider 구현 파일은 `Providers.tsx`, `QueryProvider.tsx`, `AuthProvider.tsx`, `ModalProvider.tsx`입니다. 기존 `@/providers`와 `@/providers/modal-provider` 경로는 배럴/호환 파일로 유지합니다. 모달 내부 기능과 공개 인터페이스는 유지합니다.

## ModalProvider

전역 모달 시스템. 두 가지 방식 중 상황에 맞는 쪽을 씁니다. 실제 화면은 두 방식 모두 이 provider 전용 최소 shell(`ModalProvider.tsx`의 `BareModal`)을 씁니다 — 배경 딤/포커스 트랩/Esc·backdrop 닫기만 책임지고, 넘긴 content(JSX)가 제목·닫기 버튼까지 전부 그립니다. 다른 feature들이 쓰는 `title` 필수 공통 `Modal`(`src/common/components/MoverModal/Modal.tsx`)과는 별개이며 그 컴포넌트를 수정하거나 재사용하지 않습니다.

## 1. state 기반 — 확인창, 폼 입력 등 공유/새로고침 유지가 필요 없는 모달

```tsx
"use client";

import { useModal } from "@/providers/modal-provider";

export function CardDeleteButton() {
  const { openModal, closeModal } = useModal();

  const handleClick = () => {
    openModal(
      <div>
        <h2>정말 삭제하시겠어요?</h2>
        <p>삭제한 카드는 복구할 수 없습니다.</p>
        <button onClick={closeModal}>취소</button>
        <button onClick={() => {/* 삭제 로직 */ closeModal();}}>삭제하기</button>
      </div>,
    );
  };

  return <button onClick={handleClick}>삭제</button>;
}
```

- `openModal(content)`는 인자 하나만 받습니다. 제목/닫기 버튼은 `content` 안에서 직접 그립니다.
- 새로고침하면 닫힙니다.

## 2. URL 기반 — 새로고침·링크 공유 후에도 열린 채 유지돼야 하는 모달

`modal-registry.ts`(`MODAL_COMPONENTS`)에 등록한 모달만 `?modal=이름` 쿼리로 열 수 있습니다. 아직 이 방식이 필요한 모달이 없어 registry는 비어 있습니다.

```tsx
// 1) 모달 컴포넌트: features/{feature}/components/에 작성, UrlModalComponentProps({ onClose }) 사용
export function CartModal({ onClose }: UrlModalComponentProps) {
  return (
    <div>
      <h2>장바구니</h2>
      <p>장바구니에 담겼습니다.</p>
      <button onClick={onClose}>닫기</button>
    </div>
  );
}

// 2) src/providers/modal-registry.ts에 등록
export const MODAL_COMPONENTS: Record<string, ComponentType<UrlModalComponentProps>> = {
  cart: CartModal,
};
```

```tsx
<Link href="?modal=cart" scroll={false}>장바구니 담기</Link>
```

- `state 기반`과 `URL 기반`은 서로 독립적으로 열리고 닫힙니다 — 한 트리거에서 두 방식을 같이 쓰지 않습니다.
- URL 기반 모달 내부에서 닫을 때는 항상 props로 받은 `onClose`를 호출합니다(URL의 `modal` 쿼리를 정리하면서 닫힙니다).

## 3. 크기 조절 — 작게 / 화면의 50% / 꽉 차게

`BareModal`은 dialog wrapper에 `w-*`/`max-w-*`를 강제하지 않습니다 — `content` 최상위 요소에 준 className이 모달 크기를 그대로 결정합니다(`max-h-[calc(100dvh-48px)]`만 항상 유지되어 뷰포트를 넘치지 않습니다).

```tsx
// 작게: 너비를 안 주면 내용 크기만큼만 좁게 나온다
openModal(<div className="p-6">...</div>);

// 화면의 50%
openModal(<div className="w-[50vw] p-6">...</div>);

// 꽉 차게 (backdrop의 p-6만큼만 여백)
openModal(<div className="h-[calc(100dvh-48px)] w-[calc(100vw-48px)] p-6">...</div>);
```

URL 기반 모달도 동일합니다 — 등록한 컴포넌트의 최상위 요소에 원하는 너비 className을 주면 됩니다.

## 접근성 참고

`BareModal`은 title을 소유하지 않아 `aria-labelledby`를 자동으로 걸어주지 않습니다. `content`(openModal에 넘기는 JSX, URL 모달 컴포넌트 모두)는 반드시 제목 역할을 하는 요소(`<h2>` 등)를 포함해야 스크린 리더 사용자가 모달 제목을 인식할 수 있습니다.
