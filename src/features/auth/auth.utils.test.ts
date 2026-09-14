import assert from "node:assert/strict";
import test from "node:test";

import type { AuthFormValues } from "./auth.types";
import {
  authHref,
  getAuthSuccessPath,
  normalizePhone,
  safeAuthRedirect,
  validateAuthForm,
} from "./auth.utils";

const VALID_VALUES: AuthFormValues = {
  name: "인증 테스트",
  email: "moving-auth@example.test",
  phone: "010-0000-0000",
  password: "MovingTest!2026",
  passwordConfirm: "MovingTest!2026",
};

test("미등록 프로필은 redirect보다 역할별 등록 화면을 우선한다", () => {
  for (const role of ["CUSTOMER", "MOVER"] as const) {
    assert.equal(
      getAuthSuccessPath({ role, profileCompleted: false }, "/favorite"),
      role === "CUSTOMER" ? "/customer-profile/register" : "/mover-profile/register",
    );
  }
});

test("프로필 등록 완료 후 내부 목적지의 query와 hash를 보존한다", () => {
  assert.equal(
    getAuthSuccessPath({ role: "CUSTOMER", profileCompleted: true }, "/favorite?from=login#list"),
    "/favorite?from=login#list",
  );
});

test("인증 성공 후 인증 화면으로 반복 이동하지 않는다", () => {
  for (const path of ["/auth/callback", "/login/customer", "/signup/mover", "/login?redirect=/", "/signup#form"]) {
    assert.equal(getAuthSuccessPath({ role: "CUSTOMER", profileCompleted: true }, path), "/");
  }
});

test("외부 주소·역슬래시·제어 문자 redirect는 거부한다", () => {
  for (const path of ["https://example.test", "//example.test", "/\\example.test", "/\nexample.test", "javascript:alert(1)"]) {
    assert.equal(safeAuthRedirect(path), undefined);
    assert.equal(authHref("/login/customer", path), "/login/customer");
  }
  assert.equal(safeAuthRedirect(["/favorite"]), undefined);
});

test("SNS 재시도와 인증 화면 전환 링크는 내부 목적지를 보존한다", () => {
  assert.equal(authHref("/login/mover", "/mover-mypage"), "/login/mover?redirect=%2Fmover-mypage");
  assert.equal(authHref("/signup/customer", "/favorite?sort=recent"), "/signup/customer?redirect=%2Ffavorite%3Fsort%3Drecent");
});

test("회원가입의 정상 값과 전화번호 정규화를 허용한다", () => {
  assert.deepEqual(validateAuthForm(VALID_VALUES, "signup"), {});
  assert.equal(normalizePhone("010 0000-0000"), "01000000000");
  assert.ok(validateAuthForm({ ...VALID_VALUES, phone: "010abc00000000" }, "signup").phone);
});

test("회원가입 비밀번호 정책·확인 불일치를 검증한다", () => {
  for (const password of ["Short1!", "abcdefgh", "12345678", "Password1", "Password!", "Password 1!"]) {
    assert.ok(validateAuthForm({ ...VALID_VALUES, password }, "signup").password);
  }
  assert.ok(validateAuthForm({ ...VALID_VALUES, passwordConfirm: "different" }, "signup").passwordConfirm);
});

test("로그인은 가입 정책을 재적용하지 않고 빈 비밀번호와 이메일 형식을 검사한다", () => {
  assert.deepEqual(validateAuthForm({ ...VALID_VALUES, password: "legacy" }, "login"), {});
  assert.ok(validateAuthForm({ ...VALID_VALUES, password: "" }, "login").password);
  assert.ok(validateAuthForm({ ...VALID_VALUES, email: "invalid" }, "login").email);
});
