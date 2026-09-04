"use client";

import Image from "next/image";
import { useState } from "react";

import { SERVICE_TYPE, type ServiceType } from "@/common/constants/domain";
import { MoveTypeCard } from "@/features/move-request/components/MoveTypeCard";

/**
 * MoveTypeCard 컴포넌트 시각 확인용 임시 미리보기 페이지.
 *
 * 실제 "이사 유형/예정일/지역 선택" 화면(진행바, 날짜 선택, 주소 모달 등)은
 * 이번 작업 범위가 아니므로 구현하지 않았다. 이 페이지는 MoveTypeCard의
 * default/hover/select 상태와 반응형(모바일 vs 태블릿·데스크톱) 레이아웃만
 * 눈으로 확인하기 위한 QA용 페이지이며, 실제 이사 유형 선택 단계가
 * 구현되면 삭제하거나 그 화면으로 대체해도 된다.
 */
const MOVE_TYPE_OPTIONS: {
  value: ServiceType;
  title: string;
  description: string;
  src: string;
}[] = [
  {
    value: SERVICE_TYPE.SMALL,
    title: "소형이사",
    description: "원룸, 투룸, 20평대 미만",
    src: "/images/move-type-small.png",
  },
  {
    value: SERVICE_TYPE.HOME,
    title: "가정이사",
    description: "쓰리룸, 20평대 이상",
    src: "/images/move-type-home.png",
  },
  {
    value: SERVICE_TYPE.OFFICE,
    title: "사무실이사",
    description: "사무실, 상업공간",
    src: "/images/move-type-office.png",
  },
];

export default function MoveTypeCardPreviewPage() {
  const [selected, setSelected] = useState<ServiceType>(SERVICE_TYPE.SMALL);

  return (
    <main className="mx-auto flex max-w-[894px] flex-col gap-8 px-6 py-12">
      <div>
        <h1 className="text-2xl-bold text-[var(--black-500)]">
          MoveTypeCard 미리보기
        </h1>
        <p className="text-md-regular text-[var(--gray-500)]">
          카드를 클릭하면 선택(checked) 상태가 되고 주황색으로 표시됩니다.
          브라우저 창 너비를 줄여 모바일(767px 이하)과 태블릿/데스크톱(768px
          이상) 레이아웃 차이를 확인하세요.
        </p>
      </div>

      <fieldset className="flex flex-col gap-4 md:flex-row">
        <legend className="sr-only">이사 유형 선택</legend>
        {MOVE_TYPE_OPTIONS.map((option) => (
          <MoveTypeCard
            key={option.value}
            name="move-type-preview"
            value={option.value}
            title={option.title}
            description={option.description}
            checked={selected === option.value}
            onChange={(value) => setSelected(value as ServiceType)}
            icon={
              <Image
                src={option.src}
                alt=""
                width={120}
                height={120}
                className="size-full object-contain"
              />
            }
          />
        ))}
      </fieldset>

      <p className="text-md-medium text-[var(--black-500)]">
        현재 선택: {MOVE_TYPE_OPTIONS.find((o) => o.value === selected)?.title}
      </p>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg-semibold text-[var(--black-500)]">
          disabled 상태 예시
        </h2>
        <div className="flex flex-col gap-4 md:flex-row">
          <MoveTypeCard
            name="move-type-preview-disabled"
            value={SERVICE_TYPE.OFFICE}
            title="사무실이사"
            description="사무실, 상업공간"
            checked={false}
            disabled
            onChange={() => {}}
            icon={
              <Image
                src="/images/move-type-office.png"
                alt=""
                width={120}
                height={120}
                className="size-full object-contain"
              />
            }
          />
        </div>
      </section>
    </main>
  );
}
