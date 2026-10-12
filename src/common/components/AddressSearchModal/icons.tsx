import type { SVGProps } from "react";

/**
 * AddressSearchModal 전용 단색 스트로크 아이콘입니다.
 * Figma의 ic/search, ic/X-circle, ic/X 컴포넌트를 최소 path로 재구현했습니다.
 * 원본 export는 상위 프레임 좌표가 섞인 조각(fragment) SVG로만 내려받을 수 있어
 * 그대로 삽입하기 어려웠고, 단순한 표준 아이콘(돋보기/X/원형 X)이라 stroke 기반으로
 * 직접 그려 currentColor로 색을 상속받게 했습니다(hover/disabled 색상 전환에 유리).
 * 실제 시각적 결과는 스크린샷과 비교해 확인했습니다.
 */

export function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="10" cy="10" r="7" />
      <line x1="15" y1="15" x2="21" y2="21" />
    </svg>
  );
}

export function ClearCircleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="9" />
      <line x1="9" y1="9" x2="15" y2="15" strokeLinecap="round" />
      <line x1="15" y1="9" x2="9" y2="15" strokeLinecap="round" />
    </svg>
  );
}

export function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden="true"
      {...props}
    >
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </svg>
  );
}
