"use client";

import { useState } from "react";

import { AddressSearchModal } from "@/common/components/AddressSearchModal";
import type { AddressResult } from "@/common/components/AddressCard";
import { DateDropdown } from "@/common/components/Dropdown";
import { SERVICE_TYPE, type ServiceType } from "@/common/constants/domain";
import { MoveDateCalendar } from "@/features/move-request/components/MoveDateCalendar";
import { MoveTypeCard } from "@/features/move-request/components/MoveTypeCard";
import { useAddressSearch } from "@/features/move-request/hooks/useAddressSearch";

/**
 * 모바일 wizard가 지금 보여주는 단계입니다. 태블릿/데스크톱은 모든 항목을 한 화면에
 * 동시에 보여주므로(실제 Figma에 단계 표시가 없음) 이 값을 사용하지 않습니다.
 * 1=이사 유형, 2=이사 예정일, 3=출발지/도착지.
 */
type MoveRequestStep = 1 | 2 | 3;

/** 주소 검색 모달이 지금 채우고 있는 대상. 모달이 닫혀 있으면 null. */
type AddressSlot = "from" | "to";

/**
 * 이 페이지가 로컬로 들고 있는 견적 요청 입력값입니다.
 * `POST /move-request` 요청/응답 계약이 아직 확정되지 않아(AGENTS.md 11번 API 후보 목록 참고)
 * 이 타입을 서버 payload 스키마로 그대로 쓰지 않습니다 — 실제 연동 시 API DTO 타입을
 * 별도로 정의하고 이 값을 그 DTO로 변환하는 mapper를 추가해야 합니다.
 */
export interface MoveRequestFormValues {
  serviceType: ServiceType | null;
  moveDate: Date | null;
  fromAddress: AddressResult | null;
  toAddress: AddressResult | null;
}

const SERVICE_TYPES: ServiceType[] = [SERVICE_TYPE.SMALL, SERVICE_TYPE.HOME, SERVICE_TYPE.OFFICE];

const STEP_COPY: Record<MoveRequestStep, { title: string; subtitle: string }> = {
  1: {
    title: "이사 유형을 선택해주세요",
    subtitle: "견적을 요청하면 최대 5개의 견적을 받을 수 있어요 :)",
  },
  2: {
    title: "이사 예정일을 선택해주세요",
    subtitle: "견적을 요청하면 최대 5개의 견적을 받을 수 있어요 :)",
  },
  3: {
    title: "이사 지역을 선택해주세요",
    subtitle: "견적을 요청하면 최대 5개의 견적을 받을 수 있어요 :)",
  },
};

const ADDRESS_MODAL_TITLE: Record<AddressSlot, string> = {
  from: "출발지를 선택해주세요",
  to: "도착지를 선택해주세요",
};

/**
 * `이사 예정일` 트리거/헤더에 쓰는 표시용 날짜 문자열을 만든다("2025년 7월 1일").
 * 서버에 보낼 payload 포맷(ISO 문자열 등)은 API 계약이 확정된 뒤 별도로 만든다 — 이 함수는
 * 화면 표시 전용이며 서버 전송용 직렬화에 재사용하지 않는다.
 */
function formatMoveDateLabel(date: Date): string {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

interface MobileStepIndicatorProps {
  /** 지금 보여주는 단계. 이 값과 같은 dot만 강조되고, 지나온 단계도 다시 회색으로 돌아간다(Figma 원본 그대로). */
  currentStep: MoveRequestStep;
}

/**
 * 모바일 wizard 전용 1/2/3 단계 표시(AGENTS.md 12번 "견적 요청" 규칙의 progress bar).
 * 태블릿/데스크톱은 Figma에 이 UI가 없다 — 항목을 한 화면에 모두 보여주므로 별도 단계 표시가 없다.
 */
function MobileStepIndicator({ currentStep }: MobileStepIndicatorProps) {
  const steps: MoveRequestStep[] = [1, 2, 3];

  return (
    <ol className="flex items-center gap-2" aria-label={`${steps.length}단계 중 ${currentStep}단계`}>
      {steps.map((step) => {
        const isCurrent = step === currentStep;
        return (
          <li key={step}>
            <span
              aria-current={isCurrent ? "step" : undefined}
              className={[
                "flex size-5 items-center justify-center rounded-full text-xs-semibold",
                isCurrent
                  ? "bg-(--primary-400) text-(--gray-50)"
                  : "bg-(--background-200) text-(--content-placeholder)",
              ].join(" ")}
            >
              {step}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

interface AddressFieldProps {
  /** 이 필드가 나타내는 주소 종류. 라벨과 버튼 문구, 검색 모달 제목 결정에 쓰인다. */
  label: "출발지" | "도착지";
  /** 이미 선택된 주소(controlled). 선택 전이면 null이며 이때 버튼은 안내 문구를 보여준다. */
  address: AddressResult | null;
  /** 버튼(또는 "수정하기" 링크)을 눌렀을 때 호출된다. 실제 검색 모달 열기는 호출부가 담당한다. */
  onOpen: () => void;
  className?: string;
}

/**
 * 출발지/도착지 한 칸을 표현하는 페이지 전용 조각입니다. Figma에서 두 상태(선택 전/후)가
 * 있는데, 선택 후에는 버튼 안에 실제 도로명 주소가 orange 텍스트로 표시되고 버튼 아래에
 * "수정하기" 링크가 추가로 나타난다 — 두 상태 모두 버튼을 다시 누르면 같은 검색 모달이 연다.
 * 실제 주소 검색은 공통 `AddressSearchModal`이 담당하므로 이 컴포넌트는 트리거 버튼만 그린다.
 */
function AddressField({ label, address, onOpen, className }: AddressFieldProps) {
  return (
    <div className={["flex w-full flex-col items-end gap-2", className].filter(Boolean).join(" ")}>
      <div className="flex w-full flex-col gap-3">
        <span className="text-lg-medium text-(--content-strong)">{label}</span>
        <button
          type="button"
          onClick={onOpen}
          aria-label={address ? `${label} 다시 선택하기` : `${label} 선택하기`}
          className="flex h-[54px] w-full items-center rounded-xl border border-(--primary-400) px-6 py-4 text-left"
        >
          <span className="text-lg-semibold min-w-0 flex-1 truncate text-(--primary-400)">
            {address ? address.roadAddress : `${label} 선택하기`}
          </span>
        </button>
      </div>

      {address ? (
        <button type="button" onClick={onOpen} className="text-xs-medium text-(--black-100) underline">
          수정하기
        </button>
      ) : null}
    </div>
  );
}

interface MobileMoveRequestWizardProps {
  step: MoveRequestStep;
  onStepChange: (step: MoveRequestStep) => void;
  serviceType: ServiceType | null;
  onServiceTypeChange: (value: ServiceType) => void;
  moveDate: Date | null;
  onMoveDateChange: (date: Date) => void;
  fromAddress: AddressResult | null;
  toAddress: AddressResult | null;
  onOpenAddressModal: (slot: AddressSlot) => void;
  onSubmit: () => void;
}

/**
 * 375px대 모바일 전용 1문항-1화면 wizard입니다(Figma `견적요청/Mobile` 세 프레임).
 * 태블릿(744px)부터는 `DesktopMoveRequestForm`이 모든 항목을 한 화면에 보여주므로 이 컴포넌트는
 * `min-[744px]:hidden`으로 그 폭에서 완전히 렌더링을 멈춘다.
 *
 * 하단 이전/다음 버튼 바는 Figma에서는 화면 안 고정 위치(top:724)로 그려져 있지만, 실제 화면은
 * 콘텐츠 길이가 기기마다 달라 스크롤이 생길 수 있어 `fixed bottom-0`로 구현했다 — 콘텐츠 영역에는
 * 그만큼 `pb-28`을 줘서 버튼 바에 가려지지 않게 한다.
 */
function MobileMoveRequestWizard({
  step,
  onStepChange,
  serviceType,
  onServiceTypeChange,
  moveDate,
  onMoveDateChange,
  fromAddress,
  toAddress,
  onOpenAddressModal,
  onSubmit,
}: MobileMoveRequestWizardProps) {
  const { title, subtitle } = STEP_COPY[step];

  const canGoNextFromStep1 = serviceType !== null;
  const canGoNextFromStep2 = moveDate !== null;
  const canSubmitStep3 = fromAddress !== null && toAddress !== null;

  return (
    <div className="min-[744px]:hidden">
      <div className="flex flex-col items-center gap-2 px-10 pt-9 pb-6 text-center">
        <MobileStepIndicator currentStep={step} />
        <div>
          <h1 className="text-xl-bold text-(--black-500)">{title}</h1>
          <p className="text-md-regular text-(--input-placeholder)">{subtitle}</p>
        </div>
      </div>

      <div className="px-5 pb-28">
        {step === 1 ? (
          <div className="flex flex-col gap-4">
            {SERVICE_TYPES.map((type) => (
              <MoveTypeCard
                key={type}
                name="mobile-service-type"
                value={type}
                checked={serviceType === type}
                onChange={onServiceTypeChange}
              />
            ))}
          </div>
        ) : null}

        {step === 2 ? (
          <div className="flex items-center justify-center pt-6">
            <MoveDateCalendar value={moveDate} onSelect={onMoveDateChange} size="48" />
          </div>
        ) : null}

        {step === 3 ? (
          <div className="flex flex-col gap-6 pt-2">
            <AddressField label="출발지" address={fromAddress} onOpen={() => onOpenAddressModal("from")} />
            <AddressField label="도착지" address={toAddress} onOpen={() => onOpenAddressModal("to")} />
          </div>
        ) : null}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 flex gap-2 border-t border-(--line-100) bg-(--gray-50) px-6 py-4">
        {step === 1 ? (
          <button
            type="button"
            disabled={!canGoNextFromStep1}
            onClick={() => onStepChange(2)}
            className="ml-auto flex h-[54px] w-[158px] items-center justify-center rounded-xl bg-(--primary-400) text-lg-semibold text-(--gray-50) disabled:cursor-not-allowed disabled:bg-(--gray-300)"
          >
            다음
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => onStepChange((step - 1) as MoveRequestStep)}
              className="flex h-[54px] flex-1 items-center justify-center rounded-xl border border-(--primary-400) text-lg-semibold text-(--primary-400)"
            >
              이전
            </button>
            {step === 2 ? (
              <button
                type="button"
                disabled={!canGoNextFromStep2}
                onClick={() => onStepChange(3)}
                className="flex h-[54px] flex-1 items-center justify-center rounded-xl bg-(--primary-400) text-lg-semibold text-(--gray-50) disabled:cursor-not-allowed disabled:bg-(--gray-300)"
              >
                다음
              </button>
            ) : (
              <button
                type="button"
                disabled={!canSubmitStep3}
                onClick={onSubmit}
                className="flex h-[54px] flex-1 items-center justify-center rounded-xl bg-(--primary-400) text-lg-semibold text-(--gray-50) disabled:cursor-not-allowed disabled:bg-(--gray-300)"
              >
                견적 요청하기
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

interface DesktopMoveRequestFormProps {
  serviceType: ServiceType | null;
  onServiceTypeChange: (value: ServiceType) => void;
  moveDate: Date | null;
  onMoveDateChange: (date: Date) => void;
  isDateDropdownOpen: boolean;
  onDateDropdownOpenChange: (isOpen: boolean) => void;
  fromAddress: AddressResult | null;
  toAddress: AddressResult | null;
  onOpenAddressModal: (slot: AddressSlot) => void;
  canSubmit: boolean;
  onSubmit: () => void;
}

/**
 * 744px 이상(태블릿/데스크톱)에서 쓰는 견적 요청 폼입니다. Figma에는 이 폭에서 별도의 단계 표시가
 * 없고 이사 유형·예정일·지역을 한 화면에 모두 보여준 뒤 "견적 요청하기" 한 번으로 제출한다
 * (AGENTS.md 12번 progress bar 규칙은 실제로 단계가 나뉘는 모바일 wizard에서만 표시하고, 여기서는
 * Figma에 없는 단계 표시를 임의로 추가하지 않았다 — 자세한 판단 근거는 작업 보고 참고).
 *
 * 태블릿(744~1199px)과 데스크톱(1200px~)의 차이:
 * - 카드 최대 너비 700px → 894px, 이사 유형 카드 간격 12px → 16px.
 * - 출발지/도착지가 태블릿에서는 세로로 쌓이고, 데스크톱에서는 2열로 나란히 배치된다.
 * (Figma에서 데스크톱은 "견적 요청하기" 버튼이 카드 바깥 페이지 우측에 따로 떠 있지만, 이 구현은
 * 태블릿과 동일하게 카드 안쪽 하단 우측에 배치했다 — 페이지 레벨 플로팅 버튼은 스크롤 동작이
 * Figma만으로 확정하기 어려워 보수적으로 단순화한 결정이며 작업 보고에 남겨둔다.)
 */
function DesktopMoveRequestForm({
  serviceType,
  onServiceTypeChange,
  moveDate,
  onMoveDateChange,
  isDateDropdownOpen,
  onDateDropdownOpenChange,
  fromAddress,
  toAddress,
  onOpenAddressModal,
  canSubmit,
  onSubmit,
}: DesktopMoveRequestFormProps) {
  return (
    <div className="hidden min-[744px]:block">
      <div className="mx-auto w-full max-w-[700px] px-6 py-10 min-[1200px]:max-w-[894px] min-[1200px]:px-0 min-[1200px]:py-16">
        <div className="w-full rounded-[40px] bg-(--gray-50) px-6 py-10 min-[1200px]:px-12 min-[1200px]:py-[70px]">
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl-bold text-(--black-500)">이사 유형, 예정일과 지역을 선택해주세요</h1>
            <p className="text-lg-regular text-(--input-placeholder)">
              견적을 요청하면 최대 5개의 견적을 받을 수 있어요 :)
            </p>
          </div>

          <div className="mt-14 flex flex-col gap-12 min-[1200px]:gap-16">
            <section className="flex flex-col gap-4">
              <h2 className="text-2lg-bold text-(--black-300)">이사 유형</h2>
              <div className="flex gap-3 min-[1200px]:gap-4">
                {SERVICE_TYPES.map((type) => (
                  <MoveTypeCard
                    key={type}
                    name="desktop-service-type"
                    value={type}
                    checked={serviceType === type}
                    onChange={onServiceTypeChange}
                    className="flex-1"
                  />
                ))}
              </div>
            </section>

            <div className="flex flex-col gap-8">
              <div className="flex w-full items-start justify-between gap-4">
                <h2 className="text-2lg-bold shrink-0 text-(--black-300)">이사 예정일</h2>
                <div className="w-[400px] shrink-0">
                  <DateDropdown
                    valueLabel={moveDate ? formatMoveDateLabel(moveDate) : "이사 예정일을 선택해주세요"}
                    isOpen={isDateDropdownOpen}
                    onOpenChange={onDateDropdownOpenChange}
                    panel={
                      <div className="flex w-[400px] flex-col items-center gap-4 rounded-2xl border border-(--gray-300) bg-(--gray-50) px-4 py-8 shadow-[2px_2px_10px_0px_rgba(224,224,224,0.2)]">
                        <MoveDateCalendar value={moveDate} onSelect={onMoveDateChange} size="40" />
                        <button
                          type="button"
                          disabled={!moveDate}
                          onClick={() => onDateDropdownOpenChange(false)}
                          className="flex h-[54px] w-[279px] items-center justify-center rounded-xl bg-(--primary-400) text-lg-semibold text-(--gray-50) disabled:cursor-not-allowed disabled:bg-(--gray-300)"
                        >
                          선택완료
                        </button>
                      </div>
                    }
                  />
                </div>
              </div>

              <div className="h-px w-full bg-(--line-100)" aria-hidden="true" />

              <div className="flex w-full items-start justify-between gap-4">
                <h2 className="text-2lg-bold shrink-0 text-(--black-300)">이사 지역</h2>
                <div className="flex w-[400px] flex-col gap-4 min-[1200px]:w-[520px] min-[1200px]:flex-row">
                  <AddressField
                    label="출발지"
                    address={fromAddress}
                    onOpen={() => onOpenAddressModal("from")}
                    className="min-[1200px]:w-[252px]"
                  />
                  <AddressField
                    label="도착지"
                    address={toAddress}
                    onOpen={() => onOpenAddressModal("to")}
                    className="min-[1200px]:w-[252px]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-14 flex justify-end">
            <button
              type="button"
              disabled={!canSubmit}
              onClick={onSubmit}
              className="flex h-16 w-[200px] items-center justify-center rounded-2xl bg-(--primary-400) text-2lg-semibold text-(--gray-50) disabled:cursor-not-allowed disabled:bg-(--gray-300)"
            >
              견적 요청하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 견적 요청 페이지입니다. 화면 상태를 전부 이 컴포넌트가 소유합니다(진우님 요청으로
 * `_components` 하위 파일로 나누지 않고 이 파일 하나에 모았습니다 — 여러 화면이 함께 쓰는
 * 조각인 MoveTypeCard, AddressCard/AddressSearchModal, DateDropdown, MoveDateCalendar만 그대로
 * import해서 재사용하며 내부 구현은 수정하지 않습니다).
 *
 * 반응형 전략: 744px 미만은 `MobileMoveRequestWizard`(1문항-1화면 wizard + progress bar),
 * 744px 이상은 `DesktopMoveRequestForm`(전체 항목을 한 화면에 표시)을 렌더링합니다. 실제 Figma가
 * 그렇게 나뉘어 있어(모바일 프레임에만 1/2/3 단계 표시가 존재) 두 레이아웃을 모두 렌더링하고
 * CSS로 전환합니다 — 답변 state는 이 컴포넌트 하나가 소유하므로 어느 폭에서 값을 바꿔도
 * 이후 단계·다른 레이아웃과 값이 어긋나지 않습니다(AGENTS.md 12번 "이전 답변 수정" 규칙).
 *
 * 주소 검색 연동: 타이핑 중인 값(`searchValue`)과 실제 검색에 쓰이는 값(`submittedSearchQuery`)을
 * 분리한다 — 타이핑마다 API를 호출하지 않고, Enter 또는 돋보기 버튼(`AddressSearchModal`의
 * `onSearchSubmit`)으로 명시적으로 제출했을 때만 `submittedSearchQuery`가 갱신되고, 이 값이 바뀔 때만
 * `useAddressSearch`(features/move-request/hooks)가 `/api/address/search` 프록시(Route Handler,
 * `src/app/api/address/search/route.ts`)를 호출해 `searchResults`/`isSearchLoading`을 채운다.
 * 이 프록시는 행정안전부 도로명주소 API를 감싼다 — 카카오 Local API는 검색어를 정확한 주소 1건으로
 * 확정하는 용도라 "동 이름만 입력해도 그 동에 속한 도로명주소가 전부 나와야 한다"는 요구를 만족하지
 * 못해 교체했다. juso.go.kr API 키는 이 프록시 안에서만 서버 환경변수로 쓰이며 클라이언트 번들에
 * 노출되지 않는다.
 */
export default function MoveRequestPage() {
  const [step, setStep] = useState<MoveRequestStep>(1);
  const [serviceType, setServiceType] = useState<ServiceType | null>(null);
  const [moveDate, setMoveDate] = useState<Date | null>(null);
  const [fromAddress, setFromAddress] = useState<AddressResult | null>(null);
  const [toAddress, setToAddress] = useState<AddressResult | null>(null);

  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);

  const [addressModalSlot, setAddressModalSlot] = useState<AddressSlot | null>(null);
  const [pendingAddress, setPendingAddress] = useState<AddressResult | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [submittedSearchQuery, setSubmittedSearchQuery] = useState("");
  const { results: searchResults, isLoading: isSearchLoading } =
    useAddressSearch(submittedSearchQuery);

  // "수정하기"로 이미 선택된 주소를 다시 열 때는 검색창을 비우지 않고 기존 주소의 도로명주소
  // 문자열로 즉시 재검색한다 — 그래야 모달을 열자마자 지금 선택돼 있는 주소가 목록에 그대로
  // 보이고 강조(selected) 표시도 유지된다. 새로 선택할 때(기존 값 없음)는 빈 검색창으로 연다.
  const openAddressModal = (slot: AddressSlot) => {
    const existingAddress = slot === "from" ? fromAddress : toAddress;
    const initialQuery = existingAddress?.roadAddress || existingAddress?.jibunAddress || "";

    setAddressModalSlot(slot);
    setSearchValue(initialQuery);
    setSubmittedSearchQuery(initialQuery);
    setPendingAddress(existingAddress);
  };

  const closeAddressModal = () => {
    setAddressModalSlot(null);
    setPendingAddress(null);
  };

  const handleConfirmAddress = (address: AddressResult) => {
    if (addressModalSlot === "from") {
      setFromAddress(address);
    } else if (addressModalSlot === "to") {
      setToAddress(address);
    }
    closeAddressModal();
  };

  const canSubmit =
    serviceType !== null && moveDate !== null && fromAddress !== null && toAddress !== null;

  // TODO(feature-implementer): `POST /move-request` 계약이 확정되면 TanStack Query mutation으로
  // 교체한다. 지금은 정적 마크업 단계라 실제 제출 로직이 없다.
  const handleSubmit = () => {
    if (!canSubmit) {
      return;
    }
  };

  return (
    <main className="min-h-screen bg-(--background-100)">
      <MobileMoveRequestWizard
        step={step}
        onStepChange={setStep}
        serviceType={serviceType}
        onServiceTypeChange={setServiceType}
        moveDate={moveDate}
        onMoveDateChange={setMoveDate}
        fromAddress={fromAddress}
        toAddress={toAddress}
        onOpenAddressModal={openAddressModal}
        onSubmit={handleSubmit}
      />

      <DesktopMoveRequestForm
        serviceType={serviceType}
        onServiceTypeChange={setServiceType}
        moveDate={moveDate}
        onMoveDateChange={setMoveDate}
        isDateDropdownOpen={isDateDropdownOpen}
        onDateDropdownOpenChange={setIsDateDropdownOpen}
        fromAddress={fromAddress}
        toAddress={toAddress}
        onOpenAddressModal={openAddressModal}
        canSubmit={canSubmit}
        onSubmit={handleSubmit}
      />

      <AddressSearchModal
        isOpen={addressModalSlot !== null}
        title={addressModalSlot ? ADDRESS_MODAL_TITLE[addressModalSlot] : ""}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onSearchSubmit={() => setSubmittedSearchQuery(searchValue)}
        onSearchClear={() => {
          setSearchValue("");
          setSubmittedSearchQuery("");
        }}
        results={searchResults}
        isLoading={isSearchLoading}
        selectedAddress={pendingAddress}
        onSelectAddress={setPendingAddress}
        onConfirm={handleConfirmAddress}
        onClose={closeAddressModal}
      />
    </main>
  );
}
