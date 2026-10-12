import assert from "node:assert/strict";
import test from "node:test";

import { ApiError } from "../../src/common/api/error";
import {
  CURRENT_PASSWORD_MISMATCH_MESSAGE,
  getCurrentPasswordMismatchError,
} from "../../src/common/api/get-error-message";
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

test("현재 비밀번호 불일치 API 오류는 입력 필드 메시지로 변환한다", () => {
  assert.equal(
    getCurrentPasswordMismatchError(
      new ApiError(401, "INVALID_CURRENT_PASSWORD", "현재 비밀번호가 올바르지 않습니다."),
    ),
    CURRENT_PASSWORD_MISMATCH_MESSAGE,
  );
  assert.equal(
    getCurrentPasswordMismatchError(
      new ApiError(400, "BAD_REQUEST", "현재 비밀번호가 올바르지 않습니다."),
    ),
    CURRENT_PASSWORD_MISMATCH_MESSAGE,
  );
  assert.equal(
    getCurrentPasswordMismatchError(
      new ApiError(400, "VALIDATION_ERROR", "입력값을 확인해 주세요.", [
        { field: "currentPassword", reason: "현재 비밀번호가 일치하지 않습니다." },
      ]),
    ),
    CURRENT_PASSWORD_MISMATCH_MESSAGE,
  );
  assert.equal(
    getCurrentPasswordMismatchError(
      new ApiError(409, "PASSWORD_CHANGE_NOT_AVAILABLE", "비밀번호 변경이 불가능합니다."),
    ),
    undefined,
  );
});
