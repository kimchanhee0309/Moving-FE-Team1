"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/common/components/button";
import { ProfileImageInput } from "@/common/components/ProfileImageInput";
import {
  ProfileMultiSelectChipGroup,
  ProfileSingleSelectChipGroup,
} from "@/common/components/ProfileSelectionChip";
import { PROFILE_REGION_OPTIONS, PROFILE_SERVICE_OPTIONS } from "@/common/constants/profile";

import type {
  CustomerProfileFormProps,
  CustomerProfileFormValues,
} from "../customer-profile.types";

/**
 * 일반 유저 프로필의 이미지·이사 서비스·지역 입력과 클라이언트 검증을 담당합니다.
 * API/TanStack Query/Auth 상태는 소유하지 않으며, 확정된 mutation을 나중에 onSubmit으로 주입합니다.
 */
export function CustomerProfileForm({
  mode,
  initialValues,
  isLoading = false,
  submissionError,
  onSubmit,
}: CustomerProfileFormProps) {
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [serviceTypeIds, setServiceTypeIds] = useState(initialValues?.serviceTypeIds ?? []);
  const [region, setRegion] = useState(initialValues?.region ?? null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const isBusy = isLoading || isSubmitting;
  const hasServiceError = hasSubmitted && serviceTypeIds.length === 0;
  const hasRegionError = hasSubmitted && region === null;
  const isIncomplete = serviceTypeIds.length === 0 || region === null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setHasSubmitted(true);
    setStatusMessage("");

    if (isIncomplete || isBusy) return;

    const values: CustomerProfileFormValues = {
      profileImage,
      serviceTypeIds,
      region,
    };

    if (!onSubmit) {
      setStatusMessage("입력 내용을 확인했습니다. API 연결 후 실제 프로필에 저장됩니다.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
      setStatusMessage(mode === "register" ? "프로필이 등록되었습니다." : "프로필이 수정되었습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-55px)] bg-[var(--gray-50)] min-[744px]:pb-[5px] min-[744px]:pt-6 lg:min-h-[calc(100vh-89px)] min-[1200px]:pb-0 min-[1200px]:pt-8">
      <form
        noValidate
        aria-busy={isBusy}
        className="mx-auto flex min-h-[calc(100vh-55px)] w-full flex-col items-center gap-8 px-6 pb-10 pt-4 min-[744px]:min-h-[calc(100vh-84px)] min-[744px]:justify-between min-[744px]:px-0 min-[744px]:pt-4 min-[1024px]:max-[1199px]:min-h-[calc(100vh-118px)] min-[1200px]:min-h-[calc(100vh-121px)] min-[1200px]:max-w-[1200px] min-[1200px]:justify-center min-[1200px]:gap-14 min-[1200px]:rounded-[32px] min-[1200px]:px-10 min-[1200px]:pt-6"
        onSubmit={handleSubmit}
      >
        <div className="flex w-full max-w-[327px] flex-col items-center gap-6 min-[1200px]:max-w-[1120px] min-[1200px]:gap-10">
          <header className="w-full min-[1200px]:max-w-[640px]">
            <div className="flex flex-col gap-2 min-[1200px]:gap-7">
              <h1 className="text-xl-bold text-[var(--black-400)] min-[1200px]:!text-[32px] min-[1200px]:!leading-[42px] min-[1200px]:!font-bold">
                {mode === "register" ? "프로필 등록" : "프로필 수정"}
              </h1>
              <p className="text-md-regular text-[var(--gray-500)] min-[1200px]:!text-[20px] min-[1200px]:!leading-[32px]">
                추가 정보를 입력하여 회원가입을 완료해주세요.
              </p>
            </div>
            <hr className="mt-6 border-0 border-t border-[var(--line-100)] min-[1200px]:mt-7" />
          </header>

          <div className="flex w-full flex-col gap-6 min-[1200px]:max-w-[640px] min-[1200px]:gap-8">
            <ProfileImageInput
              className="min-[1200px]:gap-5"
              file={profileImage}
              initialImageUrl={initialValues?.profileImageUrl}
              disabled={isBusy}
              isLoading={isLoading}
              onFileChange={setProfileImage}
            />

            <hr className="w-full border-0 border-t border-[var(--line-100)]" />

            <fieldset>
              <legend className="text-lg-semibold text-[var(--black-300)] min-[1200px]:!text-[20px] min-[1200px]:!leading-[32px] min-[1200px]:!font-semibold">이용 서비스</legend>
              <p className="text-xs-regular mt-1 text-[var(--gray-400)] min-[1200px]:!text-[16px] min-[1200px]:!leading-[26px]">* 이용 서비스는 중복 선택 가능하며, 언제든 수정 가능해요!</p>
              <ProfileMultiSelectChipGroup
                options={PROFILE_SERVICE_OPTIONS}
                values={serviceTypeIds}
                size="md"
                disabled={isBusy}
                isInvalid={hasServiceError}
                className="mt-4 min-[1200px]:mt-6 min-[1200px]:gap-[14px]"
                ariaLabel="이용 서비스 선택"
                ariaDescribedBy={hasServiceError ? "customer-service-error" : undefined}
                onValuesChange={setServiceTypeIds}
              />
              {hasServiceError ? (
                <p id="customer-service-error" role="alert" className="text-xs-medium mt-2 text-[var(--primary-400)]">
                  이용 서비스를 한 개 이상 선택해 주세요.
                </p>
              ) : null}
            </fieldset>

            <hr className="w-full border-0 border-t border-[var(--line-100)]" />

            <fieldset>
              <legend className="text-lg-semibold text-[var(--black-300)] min-[1200px]:!text-[20px] min-[1200px]:!leading-[32px] min-[1200px]:!font-semibold">내가 사는 지역</legend>
              <p className="text-xs-regular mt-1 text-[var(--gray-400)] min-[1200px]:!text-[16px] min-[1200px]:!leading-[26px]">* 내가 사는 지역은 언제든 수정 가능해요!</p>
              <ProfileSingleSelectChipGroup
                name="customer-region"
                options={PROFILE_REGION_OPTIONS}
                value={region}
                size="md"
                disabled={isBusy}
                isInvalid={hasRegionError}
                required
                className="mt-4 !gap-2 min-[1200px]:mt-6 min-[1200px]:max-w-[416px] min-[1200px]:!gap-x-[14px] min-[1200px]:!gap-y-[18px]"
                ariaLabel="거주 지역 선택"
                ariaDescribedBy={hasRegionError ? "customer-region-error" : undefined}
                onValueChange={setRegion}
              />
              {hasRegionError ? (
                <p id="customer-region-error" role="alert" className="text-xs-medium mt-2 text-[var(--primary-400)]">
                  지역을 한 개 이상 선택해 주세요.
                </p>
              ) : null}
            </fieldset>
          </div>

          {submissionError ? (
            <p role="alert" className="text-md-medium w-full max-w-[640px] rounded-xl bg-[var(--secondary-red-100)] px-4 py-3 text-[var(--secondary-red-200)]">
              {submissionError}
            </p>
          ) : null}
          {statusMessage ? (
            <p role="status" className="text-md-medium w-full max-w-[640px] rounded-xl bg-[var(--primary-100)] px-4 py-3 text-[var(--primary-400)]">
              {statusMessage}
            </p>
          ) : null}
        </div>

        <div className="w-full max-w-[327px] min-[1200px]:max-w-[640px]">
          <Button
            type="submit"
            size="sm"
            fullWidth
            disabled={isIncomplete || isBusy}
            isLoading={isBusy}
            className="min-[1200px]:min-h-[60px] min-[1200px]:rounded-2xl min-[1200px]:p-4 min-[1200px]:!text-[18px] min-[1200px]:!leading-[26px] min-[1200px]:!font-semibold"
          >
            {mode === "register" ? "시작하기" : "수정하기"}
          </Button>
        </div>
      </form>
    </main>
  );
}
