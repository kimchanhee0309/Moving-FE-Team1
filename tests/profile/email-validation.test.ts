import assert from "node:assert/strict";
import test from "node:test";

import { EMAIL_ERROR_MESSAGE, emailSchema, getEmailError } from "../../src/common/validation/email";

test("Zod 이메일 스키마는 일반적인 이메일과 앞뒤 공백을 허용한다", () => {
  assert.equal(emailSchema.safeParse("user+moving@example.com").success, true);
  assert.equal(emailSchema.safeParse("  user@example.co.kr  ").success, true);
  assert.equal(getEmailError("user@example.com"), undefined);
});

test("Zod 이메일 스키마는 잘못된 주소와 255자 초과 입력을 거절한다", () => {
  for (const email of ["user", "@example.com", "user@", "user..name@example.com", "user@example", `${"a".repeat(245)}@example.com`]) {
    assert.equal(getEmailError(email), EMAIL_ERROR_MESSAGE);
  }
});
