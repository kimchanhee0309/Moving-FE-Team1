import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

import { resolveLandingHrefs } from "../../src/features/landing/landing.utils";

test("비회원·고객·기사님의 랜딩 CTA 목적지를 기존 계약대로 유지한다", () => {
  assert.deepEqual(resolveLandingHrefs(null), {
    requestHref: "/login/customer?redirect=%2Fmove-request",
    quoteHref: "/login/customer?redirect=%2Fcustomer-quote",
  });
  assert.deepEqual(resolveLandingHrefs({ role: "CUSTOMER" }), {
    requestHref: "/move-request",
    quoteHref: "/customer-quote",
  });
  assert.deepEqual(resolveLandingHrefs({ role: "MOVER" }), {
    requestHref: "/requests",
    quoteHref: "/mover-quote",
  });
});

test("초기 세션 확인 중인 랜딩 CTA에는 탐색 가능한 URL을 만들지 않는다", () => {
  assert.deepEqual(resolveLandingHrefs(null, true), {
    requestHref: null,
    quoteHref: null,
  });
});

test("랜딩 CTA는 이미지 핫스팟이 아니라 제목을 가진 실제 링크 카드다", async () => {
  const source = await readFile("src/features/landing/components/MoveTypeCta.tsx", "utf8");

  assert.match(source, /<Link/);
  assert.match(source, /<div className=\{className\} aria-busy="true"/);
  assert.doesNotMatch(source, /preventPendingNavigation|onClick=\{preventPendingNavigation\}/);
  assert.match(source, /<h3[\s>]/);
  assert.doesNotMatch(source, /Hotspot|motion\.button|request-desktop|landing-compare/);
});

test("공개 페이지는 전역 전체 화면 loading 경계 없이 본문을 즉시 제공한다", async () => {
  await assert.rejects(readFile("src/app/loading.tsx", "utf8"), { code: "ENOENT" });
});
