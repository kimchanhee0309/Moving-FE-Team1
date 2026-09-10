"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Button } from "@/common/components/Button";
import { Input } from "@/common/components/Input";
import { ROUTES } from "@/common/constants/routes";

import type {
  MoverBasicInfoFormProps,
  MoverBasicInfoFormValues,
} from "../mover-mypage.types";

const INITIAL_VALUES: MoverBasicInfoFormValues = {
  name: "김코드",
  email: "codeit@email.com",
  phone: "010-1234-5678",
  currentPassword: "",
  newPassword: "",
  newPasswordConfirm: "",
};

const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
const BASIC_INFO_FIELDS: ReadonlyArray<keyof MoverBasicInfoFormValues> = [
  "name",
  "email",
  "phone",
  "currentPassword",
  "newPassword",
  "newPasswordConfirm",
];

/**
 * 기사님 기본정보와 선택적 비밀번호 변경 입력을 검증합니다.
 * 실제 사용자 조회·수정 mutation과 인증 상태 갱신은 API 계약 확정 뒤 컨테이너에서 연결합니다.
 */
export function MoverBasicInfoForm({
  initialValues,
  isPending = false,
  submissionError,
  onSubmit,
}: MoverBasicInfoFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<MoverBasicInfoFormValues>({
    ...INITIAL_VALUES,
    ...initialValues,
  });
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const isBusy = isPending || isSubmitting;
  const normalizedPhone = values.phone.replace(/\D/g, "");
  const isChangingPassword = Boolean(
    values.currentPassword || values.newPassword || values.newPasswordConfirm,
  );

  const errors: Partial<Record<keyof MoverBasicInfoFormValues, string>> = {
    name: !values.name.trim() ? "이름을 입력해 주세요." : undefined,
    email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())
      ? "올바른 이메일 형식으로 입력해 주세요."
      : undefined,
    phone: !/^01[016789]\d{7,8}$/.test(normalizedPhone)
      ? "올바른 대한민국 전화번호를 입력해 주세요."
      : undefined,
    currentPassword:
      isChangingPassword && !values.currentPassword
        ? "현재 비밀번호를 입력해 주세요."
        : undefined,
    newPassword:
      isChangingPassword && !PASSWORD_PATTERN.test(values.newPassword)
        ? "8자 이상이며 영문, 숫자, 특수문자를 각각 포함해 주세요."
        : undefined,
    newPasswordConfirm:
      isChangingPassword && values.newPassword !== values.newPasswordConfirm
        ? "새 비밀번호가 일치하지 않습니다."
        : undefined,
  };
  const hasError = Object.values(errors).some(Boolean);

  const updateValue = (field: keyof MoverBasicInfoFormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setStatusMessage("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setHasSubmitted(true);
    setStatusMessage("");

    if (hasError || isBusy) {
      const firstInvalidField = BASIC_INFO_FIELDS.find((field) => errors[field]);
      if (firstInvalidField) {
        event.currentTarget.querySelector<HTMLInputElement>(`[name="${firstInvalidField}"]`)?.focus();
      }
      return;
    }

    if (!onSubmit) {
      setStatusMessage("입력 내용을 확인했습니다. API 연결 후 실제 기본정보에 저장됩니다.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
      setStatusMessage("기본정보가 수정되었습니다.");
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
              error={hasSubmitted ? errors.name : undefined}
              onChange={(event) => updateValue("name", event.target.value)}
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
              error={hasSubmitted ? errors.email : undefined}
              onChange={(event) => updateValue("email", event.target.value)}
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
              error={hasSubmitted ? errors.phone : undefined}
              onChange={(event) => updateValue("phone", event.target.value)}
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
              error={hasSubmitted ? errors.currentPassword : undefined}
              onChange={(event) => updateValue("currentPassword", event.target.value)}
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
              error={hasSubmitted ? errors.newPassword : undefined}
              onChange={(event) => updateValue("newPassword", event.target.value)}
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
              error={hasSubmitted ? errors.newPasswordConfirm : undefined}
              onChange={(event) => updateValue("newPasswordConfirm", event.target.value)}
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
          <Button type="submit" size="sm" fullWidth disabled={isBusy} isLoading={isBusy} className="min-[1200px]:order-2 min-[1200px]:min-h-[60px] min-[1200px]:rounded-2xl min-[1200px]:p-4 min-[1200px]:text-2lg-semibold">
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
