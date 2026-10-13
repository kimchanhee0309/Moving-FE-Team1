import assert from "node:assert/strict";
import { test } from "node:test";

import { ApiError } from "../../src/common/api/error";
import {
  BlockedImageUploadError,
  isBlockedImageUploadError,
  runImageUploadRequest,
} from "../../src/common/api/image-upload-error";

const image = new File(["image"], "profile.png", { type: "image/png" });

test("이미지를 첨부한 요청이 응답 없이 실패하거나 413이면 업로드 차단으로 본다", () => {
  // 프록시가 CORS 헤더 없이 끊으면 브라우저 fetch는 상태 코드 없이 TypeError로 실패합니다.
  assert.equal(isBlockedImageUploadError(new TypeError("Failed to fetch"), image), true);
  assert.equal(
    isBlockedImageUploadError(new ApiError(413, "UNKNOWN_ERROR", "요청 처리 중 문제가 발생했습니다."), image),
    true,
  );
});

test("이미지를 첨부하지 않은 요청의 실패는 업로드 차단으로 보지 않는다", () => {
  assert.equal(isBlockedImageUploadError(new TypeError("Failed to fetch"), null), false);
  assert.equal(isBlockedImageUploadError(new TypeError("Failed to fetch"), undefined), false);
});

test("서버가 사유를 알려 준 오류는 이미지를 첨부했어도 서버 문구를 쓰도록 제외한다", () => {
  assert.equal(
    isBlockedImageUploadError(new ApiError(400, "VALIDATION_ERROR", "프로필 이미지 업로드에 실패했습니다."), image),
    false,
  );
  assert.equal(
    isBlockedImageUploadError(new ApiError(502, "PROFILE_IMAGE_UPLOAD_FAILED", "프로필 이미지를 저장하지 못했습니다."), image),
    false,
  );
  assert.equal(isBlockedImageUploadError(new Error("unexpected"), image), false);
});

test("업로드 요청이 막히면 BlockedImageUploadError로 바꾸고 원래 오류를 cause로 남긴다", async () => {
  const cause = new TypeError("Failed to fetch");

  await assert.rejects(
    runImageUploadRequest(image, async () => { throw cause; }),
    (error: unknown) => error instanceof BlockedImageUploadError && error.cause === cause,
  );
});

test("업로드 요청이 성공하면 결과를 그대로 돌려주고 그 밖의 오류는 바꾸지 않는다", async () => {
  assert.equal(await runImageUploadRequest(image, async () => "saved"), "saved");

  // 저장 뒤 후속 요청의 실패처럼 감싸지 않은 TypeError는 이미지 업로드 실패로 분류되지 않습니다.
  const serverError = new ApiError(409, "PROFILE_ALREADY_EXISTS", "이미 프로필이 있습니다.");
  await assert.rejects(runImageUploadRequest(image, async () => { throw serverError; }), serverError);
  const withoutImage = new TypeError("Failed to fetch");
  await assert.rejects(runImageUploadRequest(null, async () => { throw withoutImage; }), withoutImage);
});
