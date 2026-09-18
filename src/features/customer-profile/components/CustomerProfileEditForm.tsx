"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Button } from "@/common/components/button";
import { Input } from "@/common/components/Input";
import { ProfileImageInput } from "@/common/components/ProfileImageInput";
import {
  ProfileMultiSelectChipGroup,
  ProfileSingleSelectChipGroup,
} from "@/common/components/ProfileSelectionChip";
import { PROFILE_REGION_OPTIONS, PROFILE_SERVICE_OPTIONS } from "@/common/constants/profile";
import { ROUTES } from "@/common/constants/routes";
import { haveSameSelection } from "@/common/utils/selection";
import { normalizeEmail, normalizePhoneDigits } from "@/common/validation/contact";
import { getEmailError } from "@/common/validation/email";
import { getCurrentPasswordError, getNewPasswordError } from "@/common/validation/password";

import type {
  CustomerProfileEditFormProps,
  CustomerProfileEditFormValues,
} from "../customer-profile.types";

type TextField = "name" | "email" | "phone" | "currentPassword" | "newPassword" | "newPasswordConfirm";

const TEXT_FIELDS: ReadonlyArray<TextField> = [
  "name",
  "email",
  "phone",
  "currentPassword",
  "newPassword",
  "newPasswordConfirm",
];

export function CustomerProfileEditForm({
  initialValues,
  isPending = false,
  submissionError,
  onSubmit,
}: CustomerProfileEditFormProps) {
  const router = useRouter();
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imageInputVersion, setImageInputVersion] = useState(0);
  const [profileImageError, setProfileImageError] = useState<string | null>(null);
  const [values, setValues] = useState(() => ({
    name: initialValues.name,
    email: initialValues.email,
    phone: initialValues.phone,
    currentPassword: initialValues.currentPassword,
    newPassword: initialValues.newPassword,
    newPasswordConfirm: initialValues.newPasswordConfirm,
  }));
  const [serviceTypeIds, setServiceTypeIds] = useState(initialValues.serviceTypeIds);
  const [region, setRegion] = useState(initialValues.region);
  const [touched, setTouched] = useState<Partial<Record<TextField, boolean>>>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const isBusy = isPending || isSubmitting;
  // 비밀번호 관리자가 현재 비밀번호만 자동완성해도 일반 프로필 수정은 막지 않습니다.
  // 새 비밀번호 입력을 시작한 경우에만 현재 비밀번호와 확인값을 함께 검증합니다.
  const isChangingPassword = Boolean(values.newPassword || values.newPasswordConfirm);
  const normalizedPhone = normalizePhoneDigits(values.phone);

  const errors: Partial<Record<TextField, string>> = {
    name: !values.name.trim()
      ? "이름을 입력해 주세요."
      : values.name.trim().length > 50 ? "이름은 50자 이하여야 합니다." : undefined,
    email: getEmailError(values.email),
    phone: !normalizedPhone || /^01[016789]\d{7,8}$/.test(normalizedPhone)
      ? undefined
      : "올바른 대한민국 전화번호를 입력해 주세요.",
    currentPassword:
      isChangingPassword && !values.currentPassword
        ? "현재 비밀번호를 입력해 주세요."
        : isChangingPassword ? getCurrentPasswordError(values.currentPassword) : undefined,
    newPassword:
      isChangingPassword ? getNewPasswordError(values.newPassword) : undefined,
    newPasswordConfirm:
      isChangingPassword && values.newPassword !== values.newPasswordConfirm
        ? "새 비밀번호가 일치하지 않습니다."
        : undefined,
  };
  const hasError = Object.values(errors).some(Boolean);
  const hasServiceError = hasSubmitted && serviceTypeIds.length === 0;
  const hasRegionError = hasSubmitted && region === null;
  const hasChanges =
    values.name.trim() !== initialValues.name.trim() ||
    normalizeEmail(values.email) !== normalizeEmail(initialValues.email) ||
    normalizedPhone !== normalizePhoneDigits(initialValues.phone) ||
    isChangingPassword ||
    profileImage !== null ||
    !haveSameSelection(serviceTypeIds, initialValues.serviceTypeIds) ||
    region !== initialValues.region;

  const updateValue = (field: TextField, value: string) => {
    setTouched((current) => ({ ...current, [field]: true }));
    setValues((current) => ({ ...current, [field]: value }));
    setStatusMessage("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setHasSubmitted(true);
    setStatusMessage("");

    if (!hasChanges || hasError || profileImageError || serviceTypeIds.length === 0 || region === null || isBusy) {
      const firstInvalidField = TEXT_FIELDS.find((field) => errors[field]);
      if (firstInvalidField) {
        event.currentTarget
          .querySelector<HTMLInputElement>(`[name="${firstInvalidField}"]`)
          ?.focus();
      }
      return;
    }

    const nextValues: CustomerProfileEditFormValues = {
      ...values,
      name: values.name.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      profileImage,
      serviceTypeIds,
      region,
    };

    setIsSubmitting(true);
    try {
      const savedProfile = await onSubmit(nextValues);
      setProfileImage(null);
      setImageInputVersion((current) => current + 1);
      setValues({
        name: savedProfile.name,
        email: savedProfile.email,
        phone: savedProfile.phone ?? "",
        currentPassword: "",
        newPassword: "",
        newPasswordConfirm: "",
      });
      setStatusMessage("프로필이 수정되었습니다.");
    } catch {
      // API 오류 메시지는 mutation 컨테이너의 submissionError로 표시합니다.
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClassName = "max-w-none min-[1200px]:[&>div]:h-16";
  const fieldClassName = "border-b border-[var(--line-100)] py-6 min-[1200px]:py-8";
  const buttonClassName =
    "min-[1200px]:min-h-[60px] min-[1200px]:rounded-2xl min-[1200px]:p-4 min-[1200px]:text-2lg-semibold";

  return (
    <main className="min-h-[calc(100vh-54px)] bg-[var(--gray-50)] px-6 min-[744px]:min-h-[calc(100vh-88px)] min-[744px]:px-0">
      <form
        noValidate
        aria-busy={isBusy}
        className="mx-auto flex w-full max-w-[327px] flex-col pb-8 pt-10 min-[744px]:pt-8 min-[1200px]:max-w-[1120px] min-[1200px]:pb-[60px] min-[1200px]:pt-[88px]"
        onSubmit={handleSubmit}
      >
        <h1 className="text-xl-bold border-b border-[var(--line-100)] pb-6 text-[var(--black-400)] min-[1200px]:text-3xl-bold min-[1200px]:pb-12">
          프로필 수정
        </h1>

        <div className="min-[1200px]:grid min-[1200px]:grid-cols-[500px_500px] min-[1200px]:gap-x-[120px]">
          <div className="flex flex-col">
            <div className={fieldClassName}>
              <Input name="name" label="이름" inputSize="sm" containerClassName={inputClassName} value={values.name} error={touched.name ? errors.name : undefined} disabled={isBusy} onBlur={() => setTouched((current) => ({ ...current, name: true }))} onChange={(event) => updateValue("name", event.target.value)} />
            </div>
            <div className={fieldClassName}>
              <Input name="email" label="이메일" type="email" autoComplete="email" inputSize="sm" containerClassName={inputClassName} value={values.email} error={touched.email ? errors.email : undefined} disabled={isBusy} onBlur={() => setTouched((current) => ({ ...current, email: true }))} onChange={(event) => updateValue("email", event.target.value)} />
            </div>
            <div className={fieldClassName}>
              <Input name="phone" label="전화번호" type="tel" autoComplete="tel" inputMode="tel" inputSize="sm" containerClassName={inputClassName} value={values.phone} error={touched.phone ? errors.phone : undefined} disabled={isBusy} onBlur={() => setTouched((current) => ({ ...current, phone: true }))} onChange={(event) => updateValue("phone", event.target.value)} />
            </div>
            <div className={fieldClassName}>
              <Input name="currentPassword" label="현재 비밀번호" type="password" autoComplete="current-password" inputSize="sm" containerClassName={inputClassName} placeholder="현재 비밀번호를 입력해 주세요" value={values.currentPassword} error={touched.currentPassword ? errors.currentPassword : undefined} disabled={isBusy} onBlur={() => setTouched((current) => ({ ...current, currentPassword: true }))} onChange={(event) => updateValue("currentPassword", event.target.value)} />
            </div>
            <div className={fieldClassName}>
              <Input name="newPassword" label="새 비밀번호" type="password" autoComplete="new-password" inputSize="sm" containerClassName={inputClassName} placeholder="새 비밀번호를 입력해 주세요" value={values.newPassword} error={touched.newPassword ? errors.newPassword : undefined} disabled={isBusy} onBlur={() => setTouched((current) => ({ ...current, newPassword: true }))} onChange={(event) => updateValue("newPassword", event.target.value)} />
            </div>
            <div className={`${fieldClassName} min-[1200px]:border-b-0`}>
              <Input name="newPasswordConfirm" label="새 비밀번호 확인" type="password" autoComplete="new-password" inputSize="sm" containerClassName={inputClassName} placeholder="새 비밀번호를 다시 입력해 주세요" value={values.newPasswordConfirm} error={touched.newPasswordConfirm ? errors.newPasswordConfirm : undefined} disabled={isBusy} onBlur={() => setTouched((current) => ({ ...current, newPasswordConfirm: true }))} onChange={(event) => updateValue("newPasswordConfirm", event.target.value)} />
            </div>
          </div>

          <div className="flex flex-col">
            <ProfileImageInput key={imageInputVersion} className={fieldClassName} file={profileImage} initialImageUrl={initialValues.profileImageUrl} disabled={isBusy} isLoading={isPending} onFileChange={(file) => { setProfileImage(file); setStatusMessage(""); }} onValidationErrorChange={setProfileImageError} />

            <fieldset className={`flex flex-col gap-4 ${fieldClassName}`}>
              <legend className="text-lg-semibold text-[var(--black-300)]">이용 서비스</legend>
              <p className="text-xs-regular text-[var(--gray-400)]">* 이용 서비스는 중복 선택 가능하며, 언제든 수정 가능해요!</p>
              <ProfileMultiSelectChipGroup options={PROFILE_SERVICE_OPTIONS} values={serviceTypeIds} size="md" disabled={isBusy} isInvalid={hasServiceError} ariaLabel="이용 서비스 선택" ariaDescribedBy={hasServiceError ? "customer-edit-service-error" : undefined} onValuesChange={(nextValues) => { setServiceTypeIds(nextValues); setStatusMessage(""); }} />
              {hasServiceError ? <p id="customer-edit-service-error" role="alert" className="text-xs-medium text-[var(--primary-400)]">이용 서비스를 한 개 이상 선택해 주세요.</p> : null}
            </fieldset>

            <fieldset className="flex flex-col gap-4 py-6 min-[1200px]:py-8">
              <legend className="text-lg-semibold text-[var(--black-300)]">내가 사는 지역</legend>
              <p className="text-xs-regular text-[var(--gray-400)]">* 내가 사는 지역은 언제든 수정 가능해요!</p>
              <ProfileSingleSelectChipGroup name="customer-edit-region" options={PROFILE_REGION_OPTIONS} value={region} size="md" disabled={isBusy} isInvalid={hasRegionError} required ariaLabel="거주 지역 선택" ariaDescribedBy={hasRegionError ? "customer-edit-region-error" : undefined} onValueChange={(nextRegion) => { setRegion(nextRegion); setStatusMessage(""); }} />
              {hasRegionError ? <p id="customer-edit-region-error" role="alert" className="text-xs-medium text-[var(--primary-400)]">지역을 선택해 주세요.</p> : null}
            </fieldset>

            {submissionError ? <p role="alert" className="text-md-medium mb-3 rounded-xl bg-[var(--secondary-red-100)] px-4 py-3 text-[var(--secondary-red-200)]">{submissionError}</p> : null}
            {statusMessage ? <p role="status" className="text-md-medium mb-3 rounded-xl bg-[var(--primary-100)] px-4 py-3 text-[var(--primary-400)]">{statusMessage}</p> : null}

            <div className="flex flex-col gap-2 min-[1200px]:grid min-[1200px]:grid-cols-2 min-[1200px]:gap-5">
              <Button type="submit" size="sm" fullWidth disabled={!hasChanges || isBusy || hasError || serviceTypeIds.length === 0 || region === null || Boolean(profileImageError)} isLoading={isBusy} className={`min-[1200px]:order-2 ${buttonClassName}`}>수정하기</Button>
              <Button type="button" size="sm" variant="outlined" fullWidth disabled={isBusy} className={`min-[1200px]:order-1 ${buttonClassName}`} onClick={() => router.push(ROUTES.HOME)}>취소</Button>
            </div>
          </div>
        </div>
      </form>
    </main>
  );
}
