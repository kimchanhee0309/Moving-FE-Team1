"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/common/components/button";
import { Input, Textarea } from "@/common/components/Input";
import { ProfileImageInput } from "@/common/components/ProfileImageInput";
import { ProfileMultiSelectChipGroup } from "@/common/components/ProfileSelectionChip";
import { PROFILE_REGION_OPTIONS, PROFILE_SERVICE_OPTIONS } from "@/common/constants/profile";

import type { MoverProfileFormProps, MoverProfileFormValues } from "../mover-profile.types";

interface MoverTextValues {
  nickname: string;
  careerYears: string;
  shortIntroduction: string;
  description: string;
}

const EMPTY_TEXT_VALUES: MoverTextValues = {
  nickname: "",
  careerYears: "",
  shortIntroduction: "",
  description: "",
};

function getMoverTextErrors(values: MoverTextValues) {
  return {
    nickname: !values.nickname.trim() ? "별명을 입력해 주세요." : undefined,
    careerYears: !/^\d+$/.test(values.careerYears.trim())
      ? "경력은 0 이상의 숫자로 입력해 주세요."
      : undefined,
    shortIntroduction: !values.shortIntroduction.trim()
      ? "한 줄 소개를 입력해 주세요."
      : undefined,
    description: !values.description.trim()
      ? "상세 설명을 입력해 주세요."
      : undefined,
  };
}

/**
 * 기사님 프로필의 멀티파트 이미지 후보와 소개·서비스·지역 입력을 관리합니다.
 * 인증 훅과 서버 상태는 수정하지 않고, 확정된 mutation을 onSubmit으로 받는 페이지 전용 폼 경계입니다.
 */
export function MoverProfileForm({
  mode,
  initialValues,
  isLoading = false,
  submissionError,
  onSubmit,
}: MoverProfileFormProps) {
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [textValues, setTextValues] = useState<MoverTextValues>(
    initialValues
      ? {
          nickname: initialValues.nickname,
          careerYears: initialValues.careerYears,
          shortIntroduction: initialValues.shortIntroduction,
          description: initialValues.description,
        }
      : EMPTY_TEXT_VALUES,
  );
  const [serviceTypeIds, setServiceTypeIds] = useState(initialValues?.serviceTypeIds ?? []);
  const [regions, setRegions] = useState(initialValues?.regions ?? []);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const isBusy = isLoading || isSubmitting;
  const rawFieldErrors = getMoverTextErrors(textValues);
  const hasServiceError = hasSubmitted && serviceTypeIds.length === 0;
  const hasRegionError = hasSubmitted && regions.length === 0;
  const isIncomplete =
    Object.values(textValues).some((value) => !value.trim()) ||
    serviceTypeIds.length === 0 ||
    regions.length === 0;

  const updateTextValue = (field: keyof MoverTextValues, value: string) => {
    setTextValues((current) => ({ ...current, [field]: value }));
    setStatusMessage("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setHasSubmitted(true);
    setStatusMessage("");

    if (isIncomplete || Object.values(rawFieldErrors).some(Boolean) || isBusy) return;

    const values: MoverProfileFormValues = {
      profileImage,
      nickname: textValues.nickname.trim(),
      careerYears: textValues.careerYears.trim(),
      shortIntroduction: textValues.shortIntroduction.trim(),
      description: textValues.description.trim(),
      serviceTypeIds,
      regions,
    };

    if (!onSubmit) {
      setStatusMessage("입력 내용을 확인했습니다. API 연결 후 실제 프로필에 저장됩니다.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
      setStatusMessage(mode === "register" ? "기사님 프로필이 등록되었습니다." : "기사님 프로필이 수정되었습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const responsiveInputClass = "max-w-none min-[1200px]:[&>div]:h-16";
  const sectionClass = "border-b border-[var(--line-100)] py-6 min-[1200px]:py-8";
  const responsiveButtonClass =
    "min-[1200px]:min-h-[60px] min-[1200px]:rounded-2xl min-[1200px]:p-4 min-[1200px]:text-2lg-semibold";

  return (
    <main className="min-h-[calc(100vh-54px)] bg-[var(--gray-50)] px-6 min-[744px]:min-h-[calc(100vh-88px)] min-[744px]:px-0">
      <form
        noValidate
        aria-busy={isBusy}
        className="mx-auto flex min-h-[calc(100vh-54px)] w-full max-w-[327px] flex-col pb-6 pt-8 min-[744px]:min-h-[calc(100vh-88px)] min-[744px]:pt-6 min-[1200px]:max-w-[1120px] min-[1200px]:pb-[30px] min-[1200px]:pt-[88px]"
        onSubmit={handleSubmit}
      >
        <header className="border-b border-[var(--line-100)] pb-6 min-[1200px]:pb-12">
          <h1 className="text-xl-bold text-[var(--black-400)] min-[1200px]:text-3xl-bold">
            {mode === "register" ? "기사님 프로필 등록" : "프로필 수정"}
          </h1>
          {mode === "register" ? (
            <p className="text-md-regular mt-2 text-[var(--gray-500)] min-[1200px]:mt-6 min-[1200px]:text-xl-regular">
              추가 정보를 입력하여 회원가입을 완료해주세요.
            </p>
          ) : null}
        </header>

        <div className="min-[1200px]:grid min-[1200px]:grid-cols-[500px_500px] min-[1200px]:gap-x-[120px]">
          <div className="flex flex-col">
            <ProfileImageInput
              className={sectionClass}
              file={profileImage}
              initialImageUrl={initialValues?.profileImageUrl}
              disabled={isBusy}
              isLoading={isLoading}
              onFileChange={setProfileImage}
            />

            <div className={sectionClass}>
              <Input
                label="별명"
                required
                inputSize="sm"
                containerClassName={responsiveInputClass}
                placeholder="사이트에 노출될 별명을 입력해 주세요"
                value={textValues.nickname}
                error={hasSubmitted ? rawFieldErrors.nickname : undefined}
                disabled={isBusy}
                onChange={(event) => updateTextValue("nickname", event.target.value)}
              />
            </div>
            <div className={sectionClass}>
              <Input
                label="경력"
                required
                inputSize="sm"
                containerClassName={responsiveInputClass}
                type="number"
                min="0"
                inputMode="numeric"
                placeholder="기사님의 경력을 입력해 주세요"
                value={textValues.careerYears}
                error={hasSubmitted ? rawFieldErrors.careerYears : undefined}
                disabled={isBusy}
                onChange={(event) => updateTextValue("careerYears", event.target.value)}
              />
            </div>
            <div className={sectionClass}>
              <Input
                label="한 줄 소개"
                required
                inputSize="sm"
                containerClassName={responsiveInputClass}
                placeholder="한 줄 소개를 입력해 주세요"
                value={textValues.shortIntroduction}
                error={hasSubmitted ? rawFieldErrors.shortIntroduction : undefined}
                disabled={isBusy}
                onChange={(event) => updateTextValue("shortIntroduction", event.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col">
            <div className={sectionClass}>
              <Textarea
                label="상세 설명"
                required
                inputSize="sm"
                containerClassName="max-w-none min-[1200px]:[&>div]:px-6"
                placeholder="상세 내용을 입력해 주세요"
                value={textValues.description}
                error={hasSubmitted ? rawFieldErrors.description : undefined}
                disabled={isBusy}
                onChange={(event) => updateTextValue("description", event.target.value)}
              />
            </div>

            <fieldset className={`flex flex-col gap-4 ${sectionClass}`}>
              <legend className="text-lg-semibold text-[var(--black-300)]">
                제공 서비스 <span className="text-[var(--primary-400)]" aria-hidden="true">*</span>
              </legend>
              <ProfileMultiSelectChipGroup
                options={PROFILE_SERVICE_OPTIONS}
                values={serviceTypeIds}
                size="md"
                disabled={isBusy}
                isInvalid={hasServiceError}
                ariaLabel="제공 서비스 선택"
                ariaDescribedBy={hasServiceError ? "mover-service-error" : undefined}
                onValuesChange={setServiceTypeIds}
              />
              {hasServiceError ? (
                <p id="mover-service-error" role="alert" className="text-xs-medium text-[var(--primary-400)]">
                  제공 서비스를 한 개 이상 선택해 주세요.
                </p>
              ) : null}
            </fieldset>

            <fieldset className="flex flex-col gap-4 py-6 min-[1200px]:py-8">
              <legend className="text-lg-semibold text-[var(--black-300)]">
                서비스 가능 지역 <span className="text-[var(--primary-400)]" aria-hidden="true">*</span>
              </legend>
              <ProfileMultiSelectChipGroup
                options={PROFILE_REGION_OPTIONS}
                values={regions}
                size="md"
                disabled={isBusy}
                isInvalid={hasRegionError}
                ariaLabel="서비스 가능 지역 선택"
                ariaDescribedBy={hasRegionError ? "mover-region-error" : undefined}
                onValuesChange={setRegions}
              />
              {hasRegionError ? (
                <p id="mover-region-error" role="alert" className="text-xs-medium text-[var(--primary-400)]">
                  서비스 가능 지역을 한 개 이상 선택해 주세요.
                </p>
              ) : null}
            </fieldset>

            {submissionError ? (
              <p role="alert" className="text-md-medium mb-3 rounded-xl bg-[var(--secondary-red-100)] px-4 py-3 text-[var(--secondary-red-200)]">
                {submissionError}
              </p>
            ) : null}
            {statusMessage ? (
              <p role="status" className="text-md-medium mb-3 rounded-xl bg-[var(--primary-100)] px-4 py-3 text-[var(--primary-400)]">
                {statusMessage}
              </p>
            ) : null}

            {mode === "register" ? (
              <Button type="submit" size="sm" fullWidth disabled={isIncomplete || isBusy} isLoading={isBusy} className={responsiveButtonClass}>
                시작하기
              </Button>
            ) : (
              <div className="flex flex-col gap-2 min-[1200px]:grid min-[1200px]:grid-cols-2 min-[1200px]:gap-5">
                <Button type="submit" size="sm" fullWidth disabled={isIncomplete || isBusy} isLoading={isBusy} className={`min-[1200px]:order-2 ${responsiveButtonClass}`}>
                  수정하기
                </Button>
                <Button type="button" size="sm" variant="outlined" fullWidth className={`min-[1200px]:order-1 ${responsiveButtonClass}`} onClick={() => window.history.back()}>
                  취소
                </Button>
              </div>
            )}
          </div>
        </div>
      </form>
    </main>
  );
}
