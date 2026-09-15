"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";

import { Button } from "@/common/components/button";
import { Input } from "@/common/components/Input";
import { ROUTES } from "@/common/constants/routes";
import { ApiError } from "@/common/api/error";

import type { AuthField, AuthFormErrors, AuthFormValues, AuthScreenProps, SocialProvider } from "../auth.types";
import { authHref, normalizePhone, validateAuthForm } from "../auth.utils";
import styles from "./AuthScreen.module.css";

interface AuthFormProps extends AuthScreenProps {
  /** AuthController에서 API mutation을 주입합니다. 성공 라우팅도 해당 컨테이너 책임입니다. */
  onSubmitValues: (values: AuthFormValues) => Promise<void>;
  /** 공급자 인증 시작만 요청합니다. 공급자 페이지로 이동하는 동작은 AuthController에 위임합니다. */
  onSocialLogin: (provider: SocialProvider) => Promise<void>;
  /** Provider 이메일 mutation과 화면 OAuth mutation의 isPending을 합친 값으로 제출·입력을 잠급니다. */
  isPending: boolean;
}

const INITIAL_VALUES: AuthFormValues = { name: "", email: "", phone: "", password: "", passwordConfirm: "" };
const SIGNUP_FIELDS: AuthField[] = ["name", "email", "phone", "password", "passwordConfirm"];
const LOGIN_FIELDS: AuthField[] = ["email", "password"];
const SOCIAL_PROVIDERS: { provider: SocialProvider; label: string; image: string }[] = [
  { provider: "google", label: "Google", image: "google.svg" },
  { provider: "kakao", label: "카카오", image: "kakao.svg" },
  { provider: "naver", label: "네이버", image: "naver.svg" },
];
const FIELD_LABELS: Record<AuthField, string> = { name: "이름", email: "이메일", phone: "전화번호", password: "비밀번호", passwordConfirm: "비밀번호 확인" };
const FIELD_PLACEHOLDERS: Record<AuthField, string> = { name: "성함을 입력해 주세요", email: "이메일을 입력해 주세요", phone: "숫자만 입력해 주세요", password: "비밀번호를 입력해 주세요", passwordConfirm: "비밀번호를 다시 한번 입력해 주세요" };

/**
 * 공통 Input을 이용한 화면 검증/오류 focus/중복 제출 방지를 담당합니다.
 * API 요청과 전역 인증 상태는 Provider/컨테이너에 위임합니다.
 */
export function AuthForm({ role, mode, redirectTo, onSubmitValues, onSocialLogin, isPending }: AuthFormProps) {
  const [values, setValues] = useState(INITIAL_VALUES);
  const [touched, setTouched] = useState<Partial<Record<AuthField, boolean>>>({});
  const [serverErrors, setServerErrors] = useState<AuthFormErrors>({});
  const [submitError, setSubmitError] = useState("");
  const submitLock = useRef(false);
  const fields = mode === "signup" ? SIGNUP_FIELDS : LOGIN_FIELDS;
  const errors = { ...validateAuthForm(values, mode), ...serverErrors };
  const isIncomplete = fields.some((field) => !values[field].trim());

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitLock.current || isPending) return;
    setTouched(Object.fromEntries(fields.map((field) => [field, true])));
    const validationErrors = validateAuthForm(values, mode);
    const firstInvalid = fields.find((field) => validationErrors[field]);
    if (firstInvalid) {
      event.currentTarget.querySelector<HTMLInputElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }
    // React 상태가 갱신되기 전 연속 submit도 ref로 차단합니다. 입력은 완료 전까지 잠급니다.
    submitLock.current = true;
    setServerErrors({});
    setSubmitError("");
    try {
      await onSubmitValues({ ...values, name: values.name.trim(), email: values.email.trim(), phone: normalizePhone(values.phone) });
    } catch (error) {
      if (error instanceof ApiError) {
        const fieldErrors: AuthFormErrors = {};
        // 백엔드 Validator의 details(field/reason)를 현재 폼 필드에만 연결합니다. 임의 서버 필드를 폼에 추가하지 않습니다.
        for (const detail of error.details) {
          const field = fields.find((candidate) => candidate === detail.field);
          if (field) fieldErrors[field] = detail.reason;
        }
        if (error.code === "EMAIL_ALREADY_EXISTS") fieldErrors.email = "이미 가입된 이메일입니다. 로그인해 주세요.";
        if (error.code === "PHONE_ALREADY_EXISTS") fieldErrors.phone = "이미 가입된 휴대전화 번호입니다.";
        setServerErrors(fieldErrors);
        setSubmitError(error.code === "INVALID_CREDENTIALS" ? "이메일·비밀번호와 계정 유형을 확인해 주세요." : error.message);
      } else {
        setSubmitError(error instanceof TypeError ? "서버에 연결하지 못했습니다. 네트워크 연결을 확인해 주세요." : "요청을 완료하지 못했습니다. 다시 시도해 주세요.");
      }
    } finally {
      submitLock.current = false;
    }
  }

  async function handleSocialLogin(provider: SocialProvider) {
    if (submitLock.current || isPending) return;
    submitLock.current = true;
    setSubmitError("");
    try { await onSocialLogin(provider); }
    catch (error) { setSubmitError(error instanceof ApiError && error.code === "OAUTH_NOT_CONFIGURED" ? "SNS 로그인 준비 중입니다. 이메일 로그인을 이용해 주세요." : "SNS 로그인에 실패했습니다. 다시 시도해 주세요."); }
    finally { submitLock.current = false; }
  }

  return (
    <div className={styles.content}>
      <form noValidate onSubmit={handleSubmit} aria-busy={isPending} className={styles.form}>
        <div className={styles.fields}>
          {fields.map((field) => {
            const isPassword = field === "password" || field === "passwordConfirm";
            return (
              <Input
                key={field}
                id={`auth-${field}`}
                name={field}
                label={FIELD_LABELS[field]}
                aria-required="true"
                type={isPassword ? "password" : field === "email" ? "email" : field === "phone" ? "tel" : "text"}
                autoComplete={isPassword ? (mode === "login" ? "current-password" : "new-password") : field === "phone" ? "tel" : field === "email" ? "email" : "name"}
                inputMode={field === "phone" ? "tel" : field === "email" ? "email" : undefined}
                inputSize="md"
                containerClassName={styles.field}
                value={values[field]}
                disabled={isPending}
                placeholder={FIELD_PLACEHOLDERS[field]}
                error={touched[field] ? errors[field] : undefined}
                onBlur={() => setTouched((current) => ({ ...current, [field]: true }))}
                onChange={(event) => { setValues((current) => ({ ...current, [field]: event.target.value })); setServerErrors((current) => ({ ...current, [field]: undefined })); setSubmitError(""); }}
              />
            );
          })}
        </div>
        <Button type="submit" size="md" fullWidth className={styles.submit} disabled={isIncomplete} isLoading={isPending}>
          {mode === "login" ? "로그인" : "시작하기"}
        </Button>
      </form>
      {submitError && <p className={styles.error} role="alert">{submitError}</p>}
      <p className={styles.accountSwitch}>
        {mode === "login" ? "아직 무빙 회원이 아니신가요?" : "이미 무빙 회원이신가요?"}{" "}
        <Link href={authHref(mode === "login" ? ROUTES.AUTH.SIGNUP[role] : ROUTES.AUTH.LOGIN[role], redirectTo)}>
          {mode === "login" ? "이메일로 회원가입하기" : "로그인"}
        </Link>
      </p>
      <section className={styles.social} aria-label="SNS 로그인">
        <p>SNS 계정으로 간편 가입하기</p>
        <div className={styles.socialButtons}>
          {SOCIAL_PROVIDERS.map(({ provider, label, image }) => (
            <button key={provider} type="button" aria-label={`${label}로 ${role === "CUSTOMER" ? "일반 유저" : "기사님"} 로그인`} disabled={isPending} onClick={() => void handleSocialLogin(provider)}>
              <Image src={`/images/auth/${image}`} alt="" width={72} height={72} />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
