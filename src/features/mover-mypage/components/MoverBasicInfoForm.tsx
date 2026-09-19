"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Button } from "@/common/components/button";
import { Input } from "@/common/components/Input";
import { ROUTES } from "@/common/constants/routes";
import { getPhoneError, normalizeEmail, normalizePhoneDigits } from "@/common/validation/contact";
import { getEmailError } from "@/common/validation/email";
import { getNameError } from "@/common/validation/name";
import { getCurrentPasswordError, getNewPasswordError } from "@/common/validation/password";

import type {
  MoverBasicInfoFormProps,
  MoverBasicInfoFormValues,
} from "../mover-mypage.types";

const INITIAL_VALUES: MoverBasicInfoFormValues = {
  name: "",
  email: "",
  phone: "",
  currentPassword: "",
  newPassword: "",
  newPasswordConfirm: "",
};

const BASIC_INFO_FIELDS: ReadonlyArray<keyof MoverBasicInfoFormValues> = [
  "name",
  "email",
  "phone",
  "currentPassword",
  "newPassword",
  "newPasswordConfirm",
];
type BasicInfoField = keyof MoverBasicInfoFormValues;

/**
 * 기사님 기본정보와 선택적 비밀번호 변경 입력을 검증합니다.
 * 실제 사용자 조회·수정 mutation과 인증 상태 갱신은 API 계약 확정 뒤 컨테이너에서 연결합니다.
 */
export function MoverBasicInfoForm({
  initialValues,
  isPending = false,
  submissionError,
  currentPasswordError,
  onCurrentPasswordChange,
  onSubmit,
}: MoverBasicInfoFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<MoverBasicInfoFormValues>({
    ...INITIAL_VALUES,
    ...initialValues,
  });
  const [touched, setTouched] = useState<Partial<Record<BasicInfoField, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const isBusy = isPending || isSubmitting;
  const normalizedPhone = normalizePhoneDigits(values.phone);
  const changedFields = {
    name: values.name.trim() !== initialValues.name.trim(),
    email: normalizeEmail(values.email) !== normalizeEmail(initialValues.email),
    phone: normalizedPhone !== normalizePhoneDigits(initialValues.phone),
  };
  // 이름·전화번호는 세션으로 수정하고, 이메일·비밀번호 변경만 재인증합니다.
  const isChangingPassword = Boolean(values.newPassword || values.newPasswordConfirm);
  const requiresCurrentPassword = changedFields.email || isChangingPassword;

  const errors: Partial<Record<BasicInfoField, string>> = {
    name: getNameError(values.name),
    email: getEmailError(values.email),
    phone: getPhoneError(values.phone),
    currentPassword:
      requiresCurrentPassword && !values.currentPassword
        ? "현재 비밀번호를 입력해 주세요."
        : values.currentPassword
          ? getCurrentPasswordError(values.currentPassword) ?? currentPasswordError
          : undefined,
    newPassword:
      isChangingPassword && !values.newPassword
        ? "새 비밀번호를 입력해 주세요."
        : isChangingPassword
          ? getNewPasswordError(values.newPassword)
          : undefined,
    newPasswordConfirm:
      isChangingPassword && !values.newPasswordConfirm
        ? "새 비밀번호를 다시 입력해 주세요."
        : isChangingPassword && values.newPassword !== values.newPasswordConfirm
          ? "새 비밀번호가 일치하지 않습니다."
          : undefined,
  };
  const hasError = Boolean(
    (changedFields.name && errors.name) ||
      (changedFields.email && errors.email) ||
      (changedFields.phone && errors.phone) ||
      errors.currentPassword ||
      errors.newPassword ||
      errors.newPasswordConfirm,
  );
  const hasChanges =
    changedFields.name ||
    changedFields.email ||
    changedFields.phone ||
    isChangingPassword;

  const updateValue = (field: BasicInfoField, value: string) => {
    if (field === "currentPassword") onCurrentPasswordChange?.();
    setTouched((current) => ({ ...current, [field]: true }));
    setValues((current) => ({ ...current, [field]: value }));
    setStatusMessage("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage("");

    if (!hasChanges || hasError || isBusy) {
      const firstInvalidField = BASIC_INFO_FIELDS.find((field) => errors[field]);
      if (firstInvalidField) {
        event.currentTarget.querySelector<HTMLInputElement>(`[name="${firstInvalidField}"]`)?.focus();
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const savedBasicInfo = await onSubmit({ ...values, changedFields });
      setValues({
        ...savedBasicInfo,
        currentPassword: "",
        newPassword: "",
        newPasswordConfirm: "",
      });
      setStatusMessage("기본정보가 수정되었습니다.");
    } catch {
      // API 오류 메시지는 mutation 컨테이너의 submissionError로 표시합니다.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-54px)] bg-[var(--gray-50)] px-6 min-[744px]:min-h-[calc(100vh-88px)] min-[744px]:px-0">
      <form
        noValidate
        aria-busy={isBusy}
        className="mx-auto flex w-full max-w-[327px] flex-col pb-8 pt-10 min-[744px]:pt-8 min-[1200px]:max-w-[1120px] min-[1200px]:pb-[60px] min-[1200px]:pt-[112px]"
        onSubmit={handleSubmit}
      >
        <h1 className="text-xl-bold border-b border-[var(--line-100)] pb-6 text-[var(--black-400)] min-[1200px]:text-3xl-bold min-[1200px]:pb-12">
          기본정보 수정
        </h1>

        <div className="min-[1200px]:grid min-[1200px]:grid-cols-[500px_500px] min-[1200px]:gap-x-[120px]">
          <div className="flex flex-col">
            <div className="border-b border-[var(--line-100)] py-6 min-[1200px]:py-8">
            <Input
              name="name"
              label="이름"
              inputSize="sm"
              containerClassName="max-w-none min-[1200px]:[&>div]:h-16"
              value={values.name}
              error={changedFields.name ? errors.name : undefined}
              disabled={isBusy}
              onBlur={() => setTouched((current) => ({ ...current, name: true }))}
              onChange={(event) => updateValue("name", event.currentTarget.value)}
            />
            </div>
            <div className="border-b border-[var(--line-100)] py-6 min-[1200px]:py-8">
            <Input
              name="email"
              label="이메일"
              type="email"
              autoComplete="email"
              inputSize="sm"
              containerClassName="max-w-none min-[1200px]:[&>div]:h-16"
              value={values.email}
              error={changedFields.email ? errors.email : undefined}
              disabled={isBusy}
              onBlur={() => setTouched((current) => ({ ...current, email: true }))}
              onChange={(event) => updateValue("email", event.currentTarget.value)}
            />
            </div>
            <div className="border-b border-[var(--line-100)] py-6 min-[1200px]:border-b-0 min-[1200px]:py-8">
            <Input
              name="phone"
              label="전화번호"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              inputSize="sm"
              containerClassName="max-w-none min-[1200px]:[&>div]:h-16"
              value={values.phone}
              error={changedFields.phone ? errors.phone : undefined}
              disabled={isBusy}
              onBlur={() => setTouched((current) => ({ ...current, phone: true }))}
              onChange={(event) => updateValue("phone", event.currentTarget.value)}
            />
            </div>
          </div>

          <div className="flex flex-col">
            <div className="border-b border-[var(--line-100)] py-6 min-[1200px]:py-8">
            <Input
              name="currentPassword"
              label="현재 비밀번호"
              type="password"
              autoComplete="current-password"
              inputSize="sm"
              containerClassName="max-w-none min-[1200px]:[&>div]:h-16"
              placeholder="현재 비밀번호를 입력해 주세요"
              value={values.currentPassword}
              error={requiresCurrentPassword || touched.currentPassword || values.currentPassword ? errors.currentPassword : undefined}
              helperText={
                !currentPasswordError
                  ? "이메일 또는 비밀번호를 변경할 때 현재 비밀번호를 확인합니다."
                  : undefined
              }
              disabled={isBusy}
              onBlur={() => setTouched((current) => ({ ...current, currentPassword: true }))}
              onChange={(event) => updateValue("currentPassword", event.currentTarget.value)}
            />
            </div>
            <div className="border-b border-[var(--line-100)] py-6 min-[1200px]:py-8">
            <Input
              name="newPassword"
              label="새 비밀번호"
              type="password"
              autoComplete="new-password"
              inputSize="sm"
              containerClassName="max-w-none min-[1200px]:[&>div]:h-16"
              placeholder="새 비밀번호를 입력해 주세요"
              value={values.newPassword}
              error={touched.currentPassword || touched.newPassword || values.newPassword ? errors.newPassword : undefined}
              disabled={isBusy}
              onBlur={() => setTouched((current) => ({ ...current, newPassword: true }))}
              onChange={(event) => updateValue("newPassword", event.currentTarget.value)}
            />
            </div>
            <div className="border-b border-[var(--line-100)] py-6 min-[1200px]:border-b-0 min-[1200px]:py-8">
            <Input
              name="newPasswordConfirm"
              label="새 비밀번호 확인"
              type="password"
              autoComplete="new-password"
              inputSize="sm"
              containerClassName="max-w-none min-[1200px]:[&>div]:h-16"
              placeholder="새 비밀번호를 다시 입력해 주세요"
              value={values.newPasswordConfirm}
              error={touched.newPassword || touched.newPasswordConfirm || values.newPassword || values.newPasswordConfirm ? errors.newPasswordConfirm : undefined}
              disabled={isBusy}
              onBlur={() => setTouched((current) => ({ ...current, newPasswordConfirm: true }))}
              onChange={(event) => updateValue("newPasswordConfirm", event.currentTarget.value)}
            />
            </div>
          </div>
        </div>

        {submissionError ? (
          <p role="alert" className="text-md-medium rounded-xl bg-[var(--secondary-red-100)] px-4 py-3 text-[var(--secondary-red-200)]">
            {submissionError}
          </p>
        ) : null}

        {statusMessage ? (
          <p role="status" className="text-md-medium rounded-xl bg-[var(--primary-100)] px-4 py-3 text-[var(--primary-400)]">
            {statusMessage}
          </p>
        ) : null}

        <div className="ml-auto mt-8 flex w-full flex-col gap-2 min-[1200px]:mt-6 min-[1200px]:grid min-[1200px]:max-w-[500px] min-[1200px]:grid-cols-2 min-[1200px]:gap-5">
          <Button type="submit" size="sm" fullWidth disabled={!hasChanges || isBusy || hasError} isLoading={isBusy} className="min-[1200px]:order-2 min-[1200px]:min-h-[60px] min-[1200px]:rounded-2xl min-[1200px]:p-4 min-[1200px]:text-2lg-semibold">
            수정하기
          </Button>
          <Button type="button" size="sm" variant="outlined" fullWidth disabled={isBusy} className="min-[1200px]:order-1 min-[1200px]:min-h-[60px] min-[1200px]:rounded-2xl min-[1200px]:p-4 min-[1200px]:text-2lg-semibold" onClick={() => router.push(ROUTES.MOVER.MY_PAGE)}>
            취소
          </Button>
        </div>
      </form>
    </main>
  );
}
