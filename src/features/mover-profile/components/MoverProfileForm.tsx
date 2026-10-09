"use client";

import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";

import { Button } from "@/common/components/button";
import { Input, Textarea } from "@/common/components/Input";
import { ProfileImageInput } from "@/common/components/ProfileImageInput";
import { ProfileMultiSelectChipGroup } from "@/common/components/ProfileSelectionChip";
import { PROFILE_REGION_OPTIONS, PROFILE_SERVICE_OPTIONS } from "@/common/constants/profile";
import { haveSameSelection } from "@/common/utils/selection";

import type { MoverProfileFormProps, MoverProfileFormValues } from "../mover-profile.types";

interface MoverTextValues {
  nickname: string;
  careerYears: string;
  shortIntroduction: string;
  description: string;
}

type MoverTextField = keyof MoverTextValues;

const EMPTY_TEXT_VALUES: MoverTextValues = {
  nickname: "",
  careerYears: "",
  shortIntroduction: "",
  description: "",
};

type ProfileTranslator = ReturnType<typeof useTranslations<"Profile">>;

function getMoverTextErrors(values: MoverTextValues, t: ProfileTranslator) {
  return {
    nickname: !values.nickname.trim()
      ? t("nicknameRequired")
      : values.nickname.trim().length > 50 ? t("nicknameTooLong") : undefined,
    // BE mover-profile.constants의 허용 범위(1~40년)와 같게 검증합니다.
    careerYears: !/^\d+$/.test(values.careerYears.trim()) || Number(values.careerYears) < 1 || Number(values.careerYears) > 40
      ? t("experienceInvalid")
      : undefined,
    shortIntroduction: !values.shortIntroduction.trim()
      ? t("shortIntroductionRequired")
      : values.shortIntroduction.trim().length > 255 ? t("shortIntroductionTooLong") : undefined,
    description: !values.description.trim()
      ? t("descriptionRequired")
      : values.description.trim().length > 1000 ? t("descriptionTooLong") : undefined,
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
  const t = useTranslations("Profile");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imageInputVersion, setImageInputVersion] = useState(0);
  const [profileImageError, setProfileImageError] = useState<string | null>(null);
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
  const [touched, setTouched] = useState<Partial<Record<MoverTextField, boolean>>>({});
  const [serviceTypeIds, setServiceTypeIds] = useState(initialValues?.serviceTypeIds ?? []);
  const [regions, setRegions] = useState(initialValues?.regions ?? []);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [serviceTouched, setServiceTouched] = useState(false);
  const [regionTouched, setRegionTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const isBusy = isLoading || isSubmitting;
  const rawFieldErrors = getMoverTextErrors(textValues, t);
  const changedFields = {
    nickname: !initialValues || textValues.nickname.trim() !== initialValues.nickname.trim(),
    careerYears: !initialValues || textValues.careerYears.trim() !== initialValues.careerYears.trim(),
    shortIntroduction:
      !initialValues || textValues.shortIntroduction.trim() !== initialValues.shortIntroduction.trim(),
    description: !initialValues || textValues.description.trim() !== initialValues.description.trim(),
    serviceTypeIds: !initialValues || !haveSameSelection(serviceTypeIds, initialValues.serviceTypeIds),
    regions: !initialValues || !haveSameSelection(regions, initialValues.regions),
  };
  const hasTextError = mode === "register"
    ? Object.values(rawFieldErrors).some(Boolean)
    : Boolean(
        (changedFields.nickname && rawFieldErrors.nickname) ||
          (changedFields.careerYears && rawFieldErrors.careerYears) ||
          (changedFields.shortIntroduction && rawFieldErrors.shortIntroduction) ||
          (changedFields.description && rawFieldErrors.description),
      );
  const hasServiceError = (hasSubmitted || serviceTouched) && serviceTypeIds.length === 0;
  const hasRegionError = (hasSubmitted || regionTouched) && regions.length === 0;
  const isIncomplete =
    (mode === "register" && Object.values(textValues).some((value) => !value.trim())) ||
    serviceTypeIds.length === 0 ||
    regions.length === 0 ||
    Boolean(profileImageError);
  const hasChanges =
    mode === "register" ||
    !initialValues ||
    profileImage !== null ||
    changedFields.nickname ||
    changedFields.careerYears ||
    changedFields.shortIntroduction ||
    changedFields.description ||
    changedFields.serviceTypeIds ||
    changedFields.regions;

  const updateTextValue = (field: MoverTextField, value: string) => {
    setTouched((current) => ({ ...current, [field]: true }));
    setTextValues((current) => ({ ...current, [field]: value }));
    setStatusMessage("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setHasSubmitted(true);
    setStatusMessage("");

    if (!hasChanges || isIncomplete || profileImageError || hasTextError || isBusy) return;

    const values: MoverProfileFormValues = {
      profileImage,
      nickname: textValues.nickname.trim(),
      careerYears: textValues.careerYears.trim(),
      shortIntroduction: textValues.shortIntroduction.trim(),
      description: textValues.description.trim(),
      serviceTypeIds,
      regions,
      changedFields,
    };

    setIsSubmitting(true);
    try {
      await onSubmit(values);
      setProfileImage(null);
      setImageInputVersion((current) => current + 1);
      setStatusMessage(t(mode === "register" ? "moverRegistered" : "moverUpdated"));
    } catch {
      // API 오류 메시지는 mutation 컨테이너의 submissionError로 표시합니다.
    } finally {
      setIsSubmitting(false);
    }
  };

  const responsiveInputClass =
    "max-w-none min-[1200px]:gap-4 min-[1200px]:[&>label]:flex min-[1200px]:[&>label]:min-h-8 min-[1200px]:[&>label]:items-center min-[1200px]:[&>div]:h-16";
  const responsiveTextareaClass =
    "max-w-none min-[1200px]:gap-4 min-[1200px]:[&>label]:flex min-[1200px]:[&>label]:min-h-8 min-[1200px]:[&>label]:items-center min-[1200px]:[&>div]:px-6";
  const sectionClass = "border-b border-[var(--line-100)] py-6 min-[1200px]:py-8";
  const responsiveButtonClass =
    "h-[54px] min-h-[54px] min-[1200px]:h-[60px] min-[1200px]:min-h-[60px] min-[1200px]:rounded-2xl min-[1200px]:p-4 min-[1200px]:text-2lg-semibold";

  return (
    <main className="min-h-[calc(100vh-54px)] bg-[var(--gray-50)] px-6 min-[744px]:min-h-[calc(100vh-88px)] min-[744px]:px-0">
      <form
        noValidate
        aria-busy={isBusy}
        className="mx-auto flex min-h-[calc(100vh-54px)] w-full max-w-[327px] flex-col pb-6 pt-8 min-[744px]:min-h-[calc(100vh-88px)] min-[744px]:pt-6 min-[1200px]:max-w-[1120px] min-[1200px]:pb-[13px] min-[1200px]:pt-[63px]"
        onSubmit={handleSubmit}
      >
        <header className="border-b border-[var(--line-100)] pb-6 min-[1200px]:pb-12">
          <h1 className="text-xl-bold text-[var(--black-400)] min-[1200px]:text-3xl-bold">
            {t(mode === "register" ? "moverRegisterTitle" : "editTitle")}
          </h1>
          {mode === "register" ? (
            <p className="text-md-regular mt-2 text-[var(--gray-500)] min-[1200px]:mt-6 min-[1200px]:text-xl-regular">
              {t("registerHint")}
            </p>
          ) : null}
        </header>

        <div className="min-[1200px]:grid min-[1200px]:grid-cols-[500px_500px] min-[1200px]:gap-x-[120px]">
          <div className="flex flex-col">
            <ProfileImageInput
              key={imageInputVersion}
              className={sectionClass}
              file={profileImage}
              initialImageUrl={initialValues?.profileImageUrl}
              disabled={isBusy}
              isLoading={isLoading}
              onFileChange={(file) => {
                setProfileImage(file);
                setStatusMessage("");
              }}
              onValidationErrorChange={setProfileImageError}
            />

            <div className={sectionClass}>
              <Input
                label={t("nickname")}
                required
                inputSize="sm"
                containerClassName={responsiveInputClass}
                placeholder={t("nicknamePlaceholder")}
                value={textValues.nickname}
                error={mode === "register"
                  ? touched.nickname || textValues.nickname ? rawFieldErrors.nickname : undefined
                  : changedFields.nickname ? rawFieldErrors.nickname : undefined}
                disabled={isBusy}
                onBlur={() => setTouched((current) => ({ ...current, nickname: true }))}
                onChange={(event) => updateTextValue("nickname", event.currentTarget.value)}
              />
            </div>
            <div className={sectionClass}>
              <Input
                label={t("experience")}
                required
                inputSize="sm"
                containerClassName={responsiveInputClass}
                type="number"
                min="0"
                max="50"
                inputMode="numeric"
                placeholder={t("experiencePlaceholder")}
                value={textValues.careerYears}
                error={mode === "register"
                  ? touched.careerYears || textValues.careerYears ? rawFieldErrors.careerYears : undefined
                  : changedFields.careerYears ? rawFieldErrors.careerYears : undefined}
                disabled={isBusy}
                onBlur={() => setTouched((current) => ({ ...current, careerYears: true }))}
                onChange={(event) => updateTextValue("careerYears", event.currentTarget.value)}
              />
            </div>
            <div className={sectionClass}>
              <Input
                label={t("shortIntroduction")}
                required
                inputSize="sm"
                containerClassName={responsiveInputClass}
                placeholder={t("shortIntroductionPlaceholder")}
                value={textValues.shortIntroduction}
                error={mode === "register"
                  ? touched.shortIntroduction || textValues.shortIntroduction ? rawFieldErrors.shortIntroduction : undefined
                  : changedFields.shortIntroduction ? rawFieldErrors.shortIntroduction : undefined}
                disabled={isBusy}
                onBlur={() => setTouched((current) => ({ ...current, shortIntroduction: true }))}
                onChange={(event) => updateTextValue("shortIntroduction", event.currentTarget.value)}
              />
            </div>
          </div>

          <div className="flex flex-col">
            <div className={sectionClass}>
              <Textarea
                label={t("description")}
                required
                inputSize="sm"
                containerClassName={responsiveTextareaClass}
                placeholder={t("descriptionPlaceholder")}
                value={textValues.description}
                error={mode === "register"
                  ? touched.description || textValues.description ? rawFieldErrors.description : undefined
                  : changedFields.description ? rawFieldErrors.description : undefined}
                disabled={isBusy}
                onBlur={() => setTouched((current) => ({ ...current, description: true }))}
                onChange={(event) => updateTextValue("description", event.currentTarget.value)}
              />
            </div>

            <section className={`flex flex-col gap-4 min-[1200px]:min-h-[160px] ${sectionClass}`} aria-labelledby="mover-service-title">
              <h2 id="mover-service-title" className="text-lg-semibold text-[var(--black-300)]">
                {t("providedServices")} <span className="text-[var(--primary-400)]" aria-hidden="true">*</span>
              </h2>
              <ProfileMultiSelectChipGroup
                options={PROFILE_SERVICE_OPTIONS}
                values={serviceTypeIds}
                size="md"
                disabled={isBusy}
                isInvalid={hasServiceError}
                className="min-[1200px]:gap-[14px]"
                ariaLabel={t("providedServicesSelect")}
                ariaDescribedBy={hasServiceError ? "mover-service-error" : undefined}
                onValuesChange={(nextValues) => {
                  setServiceTouched(true);
                  setServiceTypeIds(nextValues);
                  setStatusMessage("");
                }}
              />
              {hasServiceError ? (
                <p id="mover-service-error" role="alert" className="text-xs-medium text-[var(--primary-400)]">
                  {t("providedServicesError")}
                </p>
              ) : null}
            </section>

            <section className="flex flex-col gap-4 py-6 min-[1200px]:py-8" aria-labelledby="mover-region-title">
              <h2 id="mover-region-title" className="text-lg-semibold text-[var(--black-300)]">
                {t("serviceRegions")} <span className="text-[var(--primary-400)]" aria-hidden="true">*</span>
              </h2>
              <ProfileMultiSelectChipGroup
                options={PROFILE_REGION_OPTIONS}
                values={regions}
                size="md"
                disabled={isBusy}
                isInvalid={hasRegionError}
                className="min-[1200px]:max-w-[416px] min-[1200px]:!gap-x-[14px] min-[1200px]:!gap-y-[18px]"
                ariaLabel={t("serviceRegionsSelect")}
                ariaDescribedBy={hasRegionError ? "mover-region-error" : undefined}
                onValuesChange={(nextValues) => {
                  setRegionTouched(true);
                  setRegions(nextValues);
                  setStatusMessage("");
                }}
              />
              {hasRegionError ? (
                <p id="mover-region-error" role="alert" className="text-xs-medium text-[var(--primary-400)]">
                  {t("serviceRegionsError")}
                </p>
              ) : null}
            </section>

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
              <Button type="submit" size="sm" fullWidth disabled={isIncomplete || hasTextError || isBusy} isLoading={isBusy} className={responsiveButtonClass}>
                {t("submit")}
              </Button>
            ) : (
              <div className="flex flex-col gap-2 min-[1200px]:mt-10 min-[1200px]:grid min-[1200px]:grid-cols-2 min-[1200px]:gap-5">
                <Button type="submit" size="sm" fullWidth disabled={!hasChanges || isIncomplete || hasTextError || isBusy} isLoading={isBusy} className={`min-[1200px]:order-2 ${responsiveButtonClass}`}>
                  {t("edit")}
                </Button>
                <Button type="button" size="sm" variant="outlined" fullWidth disabled={isBusy} className={`min-[1200px]:order-1 ${responsiveButtonClass}`} onClick={() => window.history.back()}>
                  {t("cancel")}
                </Button>
              </div>
            )}
          </div>
        </div>
      </form>
    </main>
  );
}
