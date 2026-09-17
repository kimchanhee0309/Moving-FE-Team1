import assert from "node:assert/strict";
import { afterEach, before, mock, test } from "node:test";

let createCustomerProfile: typeof import("../../src/features/customer-profile/customer-profile.api").createCustomerProfile;
let createMoverProfile: typeof import("../../src/features/mover-profile/mover-profile.api").createMoverProfile;
let getMoverReviews: typeof import("../../src/features/mover-mypage/mover-mypage.api").getMoverReviews;
let updateMoverBasicInfo: typeof import("../../src/features/mover-mypage/mover-mypage.api").updateMoverBasicInfo;

const success = (data: unknown) => Response.json({ success: true, data });
const pathname = (input: RequestInfo | URL) => new URL(input instanceof Request ? input.url : String(input)).pathname;

before(async () => {
  process.env.NEXT_PUBLIC_API_URL = "http://localhost:4000";
  ({ createCustomerProfile } = await import("../../src/features/customer-profile/customer-profile.api"));
  ({ createMoverProfile } = await import("../../src/features/mover-profile/mover-profile.api"));
  ({ getMoverReviews, updateMoverBasicInfo } = await import("../../src/features/mover-mypage/mover-mypage.api"));
});

afterEach(() => mock.restoreAll());

test("일반 유저 프로필 등록은 multipart 배열과 지역을 백엔드 계약대로 전송한다", async () => {
  mock.method(globalThis, "fetch", async (input: RequestInfo | URL, options: RequestInit) => {
    assert.equal(pathname(input), "/customers/me/profile");
    assert.equal(options.method, "POST");
    assert.equal(options.credentials, "include");
    assert.equal(new Headers(options.headers).has("Content-Type"), false);
    assert.ok(options.body instanceof FormData);
    assert.deepEqual(options.body.getAll("serviceTypes"), ["SMALL", "HOME"]);
    assert.equal(options.body.get("region"), "서울");
    return success({
      profile: {
        id: "customer-profile-1",
        name: "테스트 고객",
        email: "customer@example.com",
        phone: null,
        profileImageUrl: null,
        serviceTypes: ["SMALL", "HOME"],
        region: "서울",
        createdAt: "2026-09-17T00:00:00.000Z",
        updatedAt: "2026-09-17T00:00:00.000Z",
      },
    });
  });

  const profile = await createCustomerProfile({
    profileImage: null,
    serviceTypeIds: ["SMALL", "HOME"],
    region: "서울",
  });
  assert.deepEqual(profile.serviceTypes, ["SMALL", "HOME"]);
  assert.equal(profile.phone, null);
});

test("기사님 프로필 등록은 서비스와 활동 지역을 반복 multipart 필드로 전송한다", async () => {
  mock.method(globalThis, "fetch", async (input: RequestInfo | URL, options: RequestInit) => {
    assert.equal(pathname(input), "/movers/me/profile");
    assert.ok(options.body instanceof FormData);
    assert.deepEqual(options.body.getAll("serviceTypes"), ["SMALL", "OFFICE"]);
    assert.deepEqual(options.body.getAll("regions"), ["서울", "경기"]);
    assert.equal(options.body.get("careerYears"), "8");
    return success({
      profile: {
        id: "mover-profile-1",
        profileImageUrl: "/uploads/mover-profiles/test.webp",
        nickname: "안전이사",
        careerYears: 8,
        shortIntroduction: "안전하게 옮겨드립니다.",
        description: "상세 소개입니다.",
        serviceTypes: ["SMALL", "OFFICE"],
        regions: ["서울", "경기"],
        createdAt: "2026-09-17T00:00:00.000Z",
        updatedAt: "2026-09-17T00:00:00.000Z",
      },
    });
  });

  const profile = await createMoverProfile({
    profileImage: null,
    nickname: "안전이사",
    careerYears: "8",
    shortIntroduction: "안전하게 옮겨드립니다.",
    description: "상세 소개입니다.",
    serviceTypeIds: ["SMALL", "OFFICE"],
    regions: ["서울", "경기"],
  });
  assert.equal(profile.profileImageUrl, "http://localhost:4000/uploads/mover-profiles/test.webp");
});

test("기사님 받은 리뷰는 실제 페이지 query와 summary를 화면 모델로 변환한다", async () => {
  mock.method(globalThis, "fetch", async (input: RequestInfo | URL) => {
    const url = new URL(input instanceof Request ? input.url : String(input));
    assert.equal(url.pathname, "/movers/me/reviews");
    assert.equal(url.searchParams.get("page"), "2");
    assert.equal(url.searchParams.get("pageSize"), "5");
    return success({
      items: [{
        id: "review-1",
        rating: 5,
        content: "친절하고 안전하게 옮겨주셨습니다.",
        createdAt: "2026-09-17T10:20:30.000Z",
        serviceType: "HOME",
        customer: { id: "customer-1", name: "홍길동", profileImageUrl: null },
      }],
      pagination: { page: 2, pageSize: 5, totalCount: 6, totalPages: 2 },
      summary: { reviewCount: 6, averageRating: 4.8 },
    });
  });

  const reviews = await getMoverReviews(2, 5);
  assert.equal(reviews.items[0]?.reviewerName, "홍길동");
  assert.equal(reviews.items[0]?.writtenAt, "2026.09.17");
  assert.equal(reviews.pagination.totalPages, 2);
  assert.equal(reviews.summary.averageRating, 4.8);
});

test("기사님 기본정보의 빈 전화번호는 null로 전송하고 비밀번호는 입력한 경우만 보낸다", async () => {
  mock.method(globalThis, "fetch", async (_input: RequestInfo | URL, options: RequestInit) => {
    const payload: unknown = JSON.parse(String(options.body));
    assert.deepEqual(payload, { name: "기사님", email: "mover@example.com", phone: null });
    return success({ basicInfo: { name: "기사님", email: "mover@example.com", phone: null } });
  });

  const basicInfo = await updateMoverBasicInfo({
    name: "기사님",
    email: "MOVER@example.com",
    phone: "",
    currentPassword: "",
    newPassword: "",
    newPasswordConfirm: "",
  });
  assert.equal(basicInfo.phone, "");
});
