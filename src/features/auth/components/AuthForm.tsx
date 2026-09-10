"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";

import { Button } from "@/common/components/Button";
import { Input } from "@/common/components/Input";
import { ROUTES } from "@/common/constants/routes";
import { ApiError } from "@/common/api/error";

import type { AuthField, AuthFormValues, AuthScreenProps, SocialProvider } from "../auth.types";
import { authHref, normalizePhone, validateAuthForm } from "../auth.utils";
import styles from "./AuthScreen.module.css";

interface AuthFormProps extends AuthScreenProps {
  /** AuthController에서 API mutation을 주입합니다. 성공 라우팅도 해당 컨테이너 책임입니다. */
  onSubmitValues?: (values: AuthFormValues) => Promise<void>;
  onSocialLogin?: (provider: SocialProvider) => Promise<void>;
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
 * API 요청은 컨테이너에 위임하며, callback 없는 독립 사용에서는 이용 불가 안내를 표시합니다.
 */
export function AuthForm({ role, mode, redirectTo, onSubmitValues, onSocialLogin }: AuthFormProps) {
  const [values, setValues] = useState(INITIAL_VALUES);
  const [touched, setTouched] = useState<Partial<Record<AuthField, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSocialProvider, setActiveSocialProvider] = useState<SocialProvider | null>(null);
  const [submitError, setSubmitError] = useState("");
  const submitLock = useRef(false);
  const fields = mode === "signup" ? SIGNUP_FIELDS : LOGIN_FIELDS;
  const errors = validateAuthForm(values, mode);
  const isIncomplete = fields.some((field) => !values[field].trim());
  const unavailableMessage = mode === "login" ? "현재 로그인을 이용할 수 없습니다. 잠시 후 다시 시도해 주세요." : "현재 회원가입을 이용할 수 없습니다. 잠시 후 다시 시도해 주세요.";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitLock.current) return;
    setTouched(Object.fromEntries(fields.map((field) => [field, true])));
    const firstInvalid = fields.find((field) => errors[field]);
    if (firstInvalid) {
      event.currentTarget.querySelector<HTMLInputElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }
    if (!onSubmitValues) { setSubmitError(unavailableMessage); return; }
    // React 상태가 갱신되기 전 연속 submit도 ref로 차단합니다. 입력은 완료 전까지 잠급니다.
    submitLock.current = true;
    setIsSubmitting(true);
    setSubmitError("");
    try {
      await onSubmitValues({ ...values, name: values.name.trim(), email: values.email.trim(), phone: normalizePhone(values.phone) });
    } catch (error) {
      setSubmitError(error instanceof ApiError && error.code === "EMAIL_ALREADY_EXISTS" ? "이미 가입된 이메일입니다. 로그인해 주세요." : error instanceof ApiError && error.status === 429 ? "요청이 많습니다. 잠시 후 다시 시도해 주세요." : mode === "login" ? "로그인하지 못했습니다. 이메일·비밀번호와 계정 유형을 확인해 주세요." : "가입하지 못했습니다. 입력 내용을 확인하고 다시 시도해 주세요.");
    } finally {
      submitLock.current = false;
      setIsSubmitting(false);
    }
  }

  async function handleSocialLogin(provider: SocialProvider) {
    if (submitLock.current) return;
    if (!onSocialLogin) { setSubmitError("현재 SNS 로그인을 이용할 수 없습니다. 잠시 후 다시 시도해 주세요."); return; }
    submitLock.current = true;
    setIsSubmitting(true);
    // 요청 잠금은 이메일 인증과 공유하되, 진행 안내는 선택한 SNS 버튼에 표시합니다.
    setActiveSocialProvider(provider);
    setSubmitError("");
    try { await onSocialLogin(provider); }
    catch (error) { setSubmitError(error instanceof ApiError && error.code === "OAUTH_NOT_CONFIGURED" ? "SNS 로그인 준비 중입니다. 이메일 로그인을 이용해 주세요." : "SNS 로그인에 실패했습니다. 다시 시도해 주세요."); }
    finally { submitLock.current = false; setIsSubmitting(false); setActiveSocialProvider(null); }
  }

  return (
    <div className={styles.content}>
      <form noValidate onSubmit={handleSubmit} aria-busy={isSubmitting} className={styles.form}>
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
                disabled={isSubmitting}
                placeholder={FIELD_PLACEHOLDERS[field]}
                error={touched[field] ? errors[field] : undefined}
                onBlur={() => setTouched((current) => ({ ...current, [field]: true }))}
                onChange={(event) => { setValues((current) => ({ ...current, [field]: event.target.value })); setSubmitError(""); }}
              />
            );
          })}
        </div>
        <Button type="submit" size="md" fullWidth className={styles.submit} disabled={isIncomplete || isSubmitting} isLoading={isSubmitting && activeSocialProvider === null}>
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
            <button key={provider} type="button" aria-label={`${label}로 ${role === "CUSTOMER" ? "일반 유저" : "기사님"} 로그인`} aria-busy={activeSocialProvider === provider} disabled={isSubmitting} onClick={() => void handleSocialLogin(provider)}>
              <Image src={`/images/auth/${image}`} alt="" width={72} height={72} />
            </button>
          ))}
        </div>
        {activeSocialProvider && (
          <p role="status" className="mt-4 text-center text-md-regular">
            {`${SOCIAL_PROVIDERS.find(({ provider }) => provider === activeSocialProvider)?.label} 로그인 화면으로 연결하고 있습니다.`}
          </p>
        )}
      </section>
    </div>
  );
}
