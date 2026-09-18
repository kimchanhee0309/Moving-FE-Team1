import assert from "node:assert/strict";
import test from "node:test";

import {
  getCurrentPasswordError,
  getNewPasswordError,
} from "../../src/common/validation/password";

test("비밀번호 오류는 바이트 대신 사용자가 이해할 수 있는 조건으로 안내한다", () => {
  assert.equal(getNewPasswordError("Ab1!"), "비밀번호는 8자 이상 입력해 주세요.");
  assert.equal(
    getNewPasswordError("abcdefgh"),
    "영문, 숫자, 특수문자를 각각 포함해 주세요.",
  );
  assert.equal(getNewPasswordError("Abcdef1!"), undefined);
});

test("현재 비밀번호는 기존 조합을 다시 강제하지 않고 길이만 확인한다", () => {
  assert.equal(getCurrentPasswordError("short"), "현재 비밀번호는 8자 이상 입력해 주세요.");
  assert.equal(getCurrentPasswordError("legacy-password"), undefined);
});
