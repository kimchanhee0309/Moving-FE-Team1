import Image from "next/image";
import Link from "next/link";

import { ROUTES } from "@/common/constants/routes";

/**
 * 이미 활성 견적 요청이 있어 새 견적 요청을 만들 수 없을 때 보여주는 안내 화면입니다.
 * Figma `견적요청_disabled/Mobile·Tablet·Desktop` (node 1:7668, 1:7651, 1:7659)를 그대로 옮겼습니다.
 *
 * AGENTS.md 12번 "견적 요청" 규칙의 "한 customer는 동시에 하나의 활성 견적 요청만 가질 수 있다"를
 * 안내하는 화면이며, 지정 요청이 아니라 일반 견적 요청 진입점(`/move-request`) 자체를 막는 상태다.
 * 활성 요청 존재 여부를 판단하는 API/쿼리 계약이 아직 없어(AGENTS.md 11번 API 후보 목록에도 없음),
 * 이 컴포넌트는 이 상태의 정적 마크업만 책임진다 — 언제 이 컴포넌트를 보여줄지는 `page.tsx`가
 * 결정하며, 실제 판단 로직은 feature-implementer가 API 계약 확정 후 붙인다.
 *
 * "받은 견적 보러가기" CTA는 Figma에 목적지가 명시돼 있지 않아, 지금 활성 요청으로 받은 견적을
 * 확인할 수 있는 기존 라우트 중 가장 가까운 `ROUTES.CUSTOMER.QUOTE.PENDING`("대기 중인 견적")으로
 * 연결했다 — 실제 목적지가 다르면(예: 확정된 요청이면 `/customer-quote`) 이 링크만 바꾸면 된다.
 */
export function MoveRequestBlockedState() {
  return (
    <div className="flex min-h-screen flex-col bg-(--background-200)">
      {/*
        페이지 제목 바. Figma 마스터 컴포넌트(`Header`, size=lg)는 이사 종류/예정일/지역/완료
        4단계 progress bar를 포함하지만 이 disabled 인스턴스들에서는 전부 숨김 처리돼 있어
        제목 텍스트만 그린다. 이 진행 바가 실제 견적 요청 폼(위저드)에도 필요한지는 이번 작업
        범위(disabled 화면) 밖이라 그대로 두었다 — 작업 보고에 별도로 남긴다.
      */}
      <header className="w-full shrink-0 bg-(--gray-50) shadow-[0px_2px_10px_rgba(248,248,248,0.1)] min-[744px]:shadow-none min-[1200px]:shadow-[0px_2px_10px_rgba(248,248,248,0.1)]">
        <div className="mx-auto flex w-full max-w-[1200px] items-center p-6 min-[744px]:h-[54px] min-[744px]:px-18 min-[744px]:py-0 min-[1200px]:h-auto min-[1200px]:px-0 min-[1200px]:py-8">
          <p className="m-0 text-2lg-semibold text-(--content-strong) min-[744px]:text-(--black-500) min-[1200px]:text-2xl-semibold">
            견적요청
          </p>
        </div>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center gap-12 px-6 py-16 min-[1200px]:gap-8">
        <div className="flex flex-col items-center">
          <div
            aria-hidden="true"
            className="relative h-[180px] w-[181px] min-[1200px]:h-[280px] min-[1200px]:w-[280px]"
          >
            {/*
              에셋 자체가 이미 30% 투명도로 export돼 있다(Figma 레이어 opacity가 export에 그대로
              반영됨) — 원본 100% 불투명 색상 에셋 위에 CSS `opacity-30`를 다시 걸면 두 번 겹쳐
              적용되어 Figma보다 훨씬 옅게 보인다. 그래서 이 이미지에는 추가 opacity를 주지 않는다.
            */}
            <Image
              src="/images/move-request/moving-car.png"
              alt=""
              fill
              sizes="(min-width: 1200px) 280px, 181px"
              className="object-contain"
            />
          </div>

          <div className="text-md-regular text-center text-(--input-placeholder) min-[1200px]:text-xl-regular">
            <p className="m-0">현재 진행 중인 이사 견적이 있어요!</p>
            <p className="m-0">진행 중인 이사 완료 후 새로운 견적을 받아보세요.</p>
          </div>
        </div>

        <Link
          href={ROUTES.CUSTOMER.QUOTE.PENDING}
          className="inline-flex h-[54px] items-center justify-center rounded-xl bg-(--primary-400) px-6 py-4 text-lg-semibold text-(--gray-50) min-[1200px]:h-16 min-[1200px]:rounded-2xl min-[1200px]:text-2lg-semibold"
        >
          받은 견적 보러가기
        </Link>
      </div>
    </div>
  );
}
