"use client";

import { useState } from "react";

import { AddressChip } from "@/common/components/AddressChip";
import {
  DESIGNATED_REQUEST_CHIP,
  MoveTypeChip,
} from "@/common/components/MoveTypeChip";
import {
  ProfileSelectionChip,
  ProfileSingleSelectChipGroup,
} from "@/common/components/ProfileSelectionChip";
import { SERVICE_TYPE } from "@/common/constants/domain";

const SERVICE_OPTIONS = ["소형이사", "가정이사", "사무실이사"] as const;
const REGION_OPTIONS = [
  "서울",
  "경기",
  "인천",
  "강원",
  "충북",
  "충남",
  "세종",
  "대전",
  "전북",
  "전남",
  "광주",
  "경북",
  "경남",
  "대구",
  "울산",
  "부산",
  "제주",
] as const;

const REGION_CHIP_OPTIONS = REGION_OPTIONS.map((region) => ({
  value: region,
  label: region,
}));

/** 실제 프로필 form 대신 Chip의 controlled 선택 계약만 검수하는 client 예시입니다. */
export function ProfileSelectionChipExamples() {
  const [selectedServices, setSelectedServices] = useState<Set<string>>(
    new Set(["소형이사"]),
  );
  const [selectedRegions, setSelectedRegions] = useState<Set<string>>(
    new Set(["서울", "경기"]),
  );
  const [livingRegion, setLivingRegion] = useState<(typeof REGION_OPTIONS)[number]>(
    "서울",
  );

  const toggleValue = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<Set<string>>>,
  ) => {
    setter((previousValues) => {
      const nextValues = new Set(previousValues);

      if (nextValues.has(value)) {
        nextValues.delete(value);
      } else {
        nextValues.add(value);
      }

      return nextValues;
    });
  };

  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col gap-5" aria-labelledby="move-type-chip-title">
        <div>
          <h2 id="move-type-chip-title" className="text-xl-bold text-[var(--black-400)]">
            이사 유형 · 지정 견적 Chip
          </h2>
          <p className="text-md-regular mt-1 text-[var(--gray-500)]">
            카드와 리뷰에서 사용하는 Figma sm·md 및 반응형 크기입니다.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3" aria-label="작은 이사 유형 Chip">
            <MoveTypeChip variant={SERVICE_TYPE.SMALL} size="sm" />
            <MoveTypeChip variant={SERVICE_TYPE.HOME} size="sm" />
            <MoveTypeChip variant={SERVICE_TYPE.OFFICE} size="sm" />
            <MoveTypeChip variant={DESIGNATED_REQUEST_CHIP} size="sm" />
          </div>
          <div className="flex flex-wrap items-center gap-3" aria-label="큰 이사 유형 Chip">
            <MoveTypeChip variant={SERVICE_TYPE.SMALL} size="md" />
            <MoveTypeChip variant={SERVICE_TYPE.HOME} size="md" />
            <MoveTypeChip variant={SERVICE_TYPE.OFFICE} size="md" />
            <MoveTypeChip variant={DESIGNATED_REQUEST_CHIP} size="md" />
          </div>
          <div className="flex flex-wrap items-center gap-3" aria-label="이사 유형 Chip 로딩 상태">
            <MoveTypeChip variant={SERVICE_TYPE.SMALL} isLoading />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-5" aria-labelledby="address-chip-title">
        <div>
          <h2 id="address-chip-title" className="text-xl-bold text-[var(--black-400)]">
            주소 형식 Chip
          </h2>
          <p className="text-md-regular mt-1 text-[var(--gray-500)]">
            주소 카드에서 도로명·지번 구분을 읽기 전용으로 표시합니다.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <AddressChip size="sm">도로명</AddressChip>
          <AddressChip size="md">도로명</AddressChip>
          <AddressChip>지번</AddressChip>
          <AddressChip isLoading>도로명</AddressChip>
        </div>
      </section>

      <section className="flex flex-col gap-5" aria-labelledby="service-chip-title">
        <div>
          <h2 id="service-chip-title" className="text-xl-bold text-[var(--black-400)]">
            제공 서비스 · MD
          </h2>
          <p className="text-md-regular mt-1 text-[var(--gray-500)]">
            프로필 등록·수정 화면의 넓은 레이아웃에서 사용하는 크기입니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-3" role="group" aria-label="제공 서비스 선택">
          {SERVICE_OPTIONS.map((service) => (
            <ProfileSelectionChip
              key={service}
              size="md"
              isSelected={selectedServices.has(service)}
              onSelectedChange={() => toggleValue(service, setSelectedServices)}
            >
              {service}
            </ProfileSelectionChip>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-5" aria-labelledby="region-chip-title">
        <div>
          <h2 id="region-chip-title" className="text-xl-bold text-[var(--black-400)]">
            서비스 가능 지역 · SM
          </h2>
          <p className="text-md-regular mt-1 text-[var(--gray-500)]">
            작은 화면에서도 자동 줄바꿈되며 선택 상태를 색상과 pressed 상태로 함께 전달합니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-3" role="group" aria-label="서비스 가능 지역 선택">
          {REGION_OPTIONS.map((region) => (
            <ProfileSelectionChip
              key={region}
              isSelected={selectedRegions.has(region)}
              onSelectedChange={() => toggleValue(region, setSelectedRegions)}
            >
              {region}
            </ProfileSelectionChip>
          ))}
        </div>
      </section>

      <section
        className="flex max-w-[600px] flex-col gap-5 border-t border-[var(--line-100)] pt-8"
        aria-labelledby="living-region-chip-title"
      >
        <div>
          <h2
            id="living-region-chip-title"
            className="text-xl-bold text-[var(--black-400)]"
          >
            내가 사는 지역
          </h2>
          <p
            id="living-region-chip-description"
            className="text-md-regular mt-1 text-[var(--gray-400)]"
          >
            내가 사는 지역은 언제든 수정 가능해요!
          </p>
        </div>
        <ProfileSingleSelectChipGroup
          name="living-region"
          options={REGION_CHIP_OPTIONS}
          value={livingRegion}
          onValueChange={setLivingRegion}
          ariaLabel="내가 사는 지역 선택"
          ariaDescribedBy="living-region-chip-description"
          required
        />
      </section>

      <section className="flex flex-col gap-5" aria-labelledby="chip-state-title">
        <h2 id="chip-state-title" className="text-xl-bold text-[var(--black-400)]">
          상태 비교
        </h2>
        <div className="flex flex-wrap gap-3" aria-describedby="chip-error-example">
          <ProfileSelectionChip isSelected={false}>Default</ProfileSelectionChip>
          <ProfileSelectionChip isSelected>Selected</ProfileSelectionChip>
          <ProfileSelectionChip isSelected={false} disabled>
            Disabled
          </ProfileSelectionChip>
          <ProfileSelectionChip isSelected isLoading>
            저장 중
          </ProfileSelectionChip>
          <ProfileSelectionChip
            isSelected={false}
            isInvalid
            aria-describedby="chip-error-example"
          >
            선택 필요
          </ProfileSelectionChip>
        </div>
        <p id="chip-error-example" className="text-xs-medium text-[var(--secondary-red-200)]">
          최소 한 개의 항목을 선택해 주세요.
        </p>
      </section>
    </div>
  );
}
