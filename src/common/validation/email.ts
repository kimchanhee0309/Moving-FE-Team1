import * as z from "zod";

export const EMAIL_ERROR_MESSAGE = "올바른 이메일 형식으로 입력해 주세요.";

/** 인증·프로필 폼이 공유하는 이메일 형식·길이 규칙입니다. */
export const emailSchema = z
  .string()
  .trim()
  .max(255, { error: EMAIL_ERROR_MESSAGE })
  .pipe(z.email({ error: EMAIL_ERROR_MESSAGE }));

export function getEmailError(value: string): string | undefined {
  const result = emailSchema.safeParse(value);
  return result.success ? undefined : result.error.issues[0]?.message ?? EMAIL_ERROR_MESSAGE;
}
