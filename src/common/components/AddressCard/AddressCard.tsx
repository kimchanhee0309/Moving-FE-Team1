import type { AddressCardProps } from "./AddressCard.types";

const FOCUS_RING =
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--black-400)";

interface AddressLineProps {
  type: "도로명" | "지번";
  value: string;
}

function AddressChip({ label }: { label: AddressLineProps["type"] }) {
  return (
    <span className="flex w-[54px] shrink-0 items-center justify-center rounded-2xl bg-(--primary-100) px-1 py-0.5 text-xs-semibold text-(--primary-400) sm:text-md-semibold">
      {label}
    </span>
  );
}

function AddressLine({ type, value }: AddressLineProps) {
  return (
    <div className="flex w-full items-start gap-2">
      <AddressChip label={type} />
      <span className="min-w-0 flex-1 [word-break:break-word] text-md-regular text-(--black-400) sm:text-lg-regular">
        {value}
      </span>
    </div>
  );
}

/**
 * Figma의 `Component/address-card` 중 카드 본문(address-card/md)을 구현한 공통 컴포넌트입니다.
 * 우편번호, 도로명 주소, 지번 주소를 보여주고 클릭/키보드로 선택할 수 있는 button입니다.
 *
 * - 크기(Figma의 sm/md variant)는 Tailwind `sm:` breakpoint(640px)를 기준으로 전환됩니다.
 *   Figma에서 `sm`은 모바일 팝업 화면(node 1:4815) 전용 사이즈이고 `md`는 태블릿/데스크톱이 함께 쓰는
 *   사이즈임을 실제 모바일 화면 목업으로 확인했다(별도 tablet 전용 사이즈는 없음) — 그래서 640px 미만(모바일)만
 *   sm 스타일을 쓰고, 640px 이상(태블릿+데스크톱)은 전부 md 스타일을 쓴다.
 * - 너비는 항상 `w-full`이며 실제 픽셀 폭은 이 카드를 담는 컨테이너(AddressSearchModal 등)가 결정합니다.
 * - 선택 상태는 배경/테두리 색상뿐 아니라 테두리 두께로도 구분해 색상만으로 상태를 전달하지 않습니다.
 */
export function AddressCard({
  address,
  selected = false,
  onSelect,
  className = "",
}: AddressCardProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect?.(address)}
      className={`flex w-full flex-col items-start gap-4 rounded-2xl border! border-solid! px-4! pt-5! pb-6! text-left drop-shadow-[2px_2px_5px_rgba(224,224,224,0.2)] transition-colors ${
        selected
          ? "border-[#e04829]! bg-(--primary-100)!"
          : "border-(--line-100)! bg-(--gray-50)! hover:border-(--gray-300)!"
      } ${FOCUS_RING} ${className}`}
    >
      <p className="text-md-semibold text-(--black-400) sm:text-lg-semibold">
        {address.zonecode}
      </p>
      <div className="flex w-full flex-col gap-4">
        <AddressLine type="도로명" value={address.roadAddress} />
        <AddressLine type="지번" value={address.jibunAddress} />
      </div>
    </button>
  );
}
