import * as z from "zod";

export const NAME_ERROR_MESSAGE = "이름은 한글 또는 영문으로 1~50자 입력해 주세요.";

// 완성형 한글·영문 이름을 허용하고 이름 사이의 공백, 하이픈, 아포스트로피, 가운뎃점을 지원합니다.
const NAME_PATTERN = /^[가-힣A-Za-z]+(?:[ '\-·][가-힣A-Za-z]+)*$/u;

export const nameSchema = z
  .string()
  .trim()
  .min(1, { error: NAME_ERROR_MESSAGE })
  .max(50, { error: NAME_ERROR_MESSAGE })
  .regex(NAME_PATTERN, { error: NAME_ERROR_MESSAGE });

export function getNameError(value: string): string | undefined {
  const result = nameSchema.safeParse(value);
  return result.success ? undefined : result.error.issues[0]?.message ?? NAME_ERROR_MESSAGE;
}
