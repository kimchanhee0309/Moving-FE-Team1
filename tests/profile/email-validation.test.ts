import assert from "node:assert/strict";
import test from "node:test";

import { EMAIL_ERROR_MESSAGE, emailSchema, getEmailError } from "../../src/common/validation/email";
import { getPhoneError, PHONE_ERROR_MESSAGE } from "../../src/common/validation/contact";
import { getNameError, NAME_ERROR_MESSAGE } from "../../src/common/validation/name";

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

test("전화번호 검증은 일반 구분자는 허용하고 문자가 섞인 값은 거절한다", () => {
  for (const phone of ["01012345678", "010-1234-5678", "(010) 1234-5678", "010.1234.5678"]) {
    assert.equal(getPhoneError(phone), undefined);
  }
  for (const phone of ["01012345678abc", "phone01012345678", "0101234567", "0212345678"]) {
    assert.equal(getPhoneError(phone), PHONE_ERROR_MESSAGE);
  }
  assert.equal(getPhoneError(""), undefined);
  assert.equal(getPhoneError("", true), PHONE_ERROR_MESSAGE);
});

test("이름 검증은 완성형 한글·영문 이름만 허용한다", () => {
  for (const name of ["김지훈", "홍 길동", "Jihoon Kim", "Anne-Marie", "O'Connor", "김·지훈"]) {
    assert.equal(getNameError(name), undefined);
  }
  for (const name of ["", "ㄱㄴㄷ", "김지훈2", "홍길동!", "a".repeat(51)]) {
    assert.equal(getNameError(name), NAME_ERROR_MESSAGE);
  }
});
