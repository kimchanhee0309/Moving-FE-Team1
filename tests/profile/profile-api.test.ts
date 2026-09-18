import assert from "node:assert/strict";
import { afterEach, before, mock, test } from "node:test";

let createCustomerProfile: typeof import("../../src/features/customer-profile/customer-profile.api").createCustomerProfile;
let updateCustomerProfile: typeof import("../../src/features/customer-profile/customer-profile.api").updateCustomerProfile;
let createMoverProfile: typeof import("../../src/features/mover-profile/mover-profile.api").createMoverProfile;
let updateMoverProfile: typeof import("../../src/features/mover-profile/mover-profile.api").updateMoverProfile;
let getMoverReviews: typeof import("../../src/features/mover-mypage/mover-mypage.api").getMoverReviews;
let updateMoverBasicInfo: typeof import("../../src/features/mover-mypage/mover-mypage.api").updateMoverBasicInfo;

const success = (data: unknown) => Response.json({ success: true, data });
const pathname = (input: RequestInfo | URL) => new URL(input instanceof Request ? input.url : String(input)).pathname;

before(async () => {
  process.env.NEXT_PUBLIC_API_URL = "http://localhost:4000";
  ({ createCustomerProfile, updateCustomerProfile } = await import("../../src/features/customer-profile/customer-profile.api"));
  ({ createMoverProfile, updateMoverProfile } = await import("../../src/features/mover-profile/mover-profile.api"));
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

test("일반 유저 프로필 수정은 검증과 동일한 숫자 전화번호를 전송한다", async () => {
  mock.method(globalThis, "fetch", async (_input: RequestInfo | URL, options: RequestInit) => {
    assert.ok(options.body instanceof FormData);
    assert.equal(options.body.get("email"), "customer@example.com");
    assert.equal(options.body.get("phone"), "01012345678");
    return success({
      profile: {
        id: "customer-profile-1",
        name: "테스트 고객",
        email: "customer@example.com",
        phone: "01012345678",
        profileImageUrl: null,
        serviceTypes: ["HOME"],
        region: "서울",
        createdAt: "2026-09-17T00:00:00.000Z",
        updatedAt: "2026-09-18T00:00:00.000Z",
      },
    });
  });

  const profile = await updateCustomerProfile({
    profileImage: null,
    serviceTypeIds: ["HOME"],
    region: "서울",
    name: "테스트 고객",
    email: "CUSTOMER@example.com",
    phone: "(010) 1234-5678",
    currentPassword: "",
    newPassword: "",
    newPasswordConfirm: "",
  });
  assert.equal(profile.phone, "01012345678");
});

test("일반 유저 비밀번호 변경은 수정하지 않은 기존 기본정보를 다시 전송하지 않는다", async () => {
  mock.method(globalThis, "fetch", async (_input: RequestInfo | URL, options: RequestInit) => {
    assert.ok(options.body instanceof FormData);
    assert.equal(options.body.has("name"), false);
    assert.equal(options.body.has("email"), false);
    assert.equal(options.body.has("phone"), false);
    assert.equal(options.body.has("serviceTypes"), false);
    assert.equal(options.body.has("region"), false);
    assert.equal(options.body.get("currentPassword"), "OldPassword1!");
    assert.equal(options.body.get("newPassword"), "NewPassword2!");
    return success({
      profile: {
        id: "customer-profile-1",
        name: "김지훈2",
        email: "customer@example.com",
        phone: "01012345678",
        profileImageUrl: null,
        serviceTypes: ["HOME"],
        region: "서울",
        createdAt: "2026-09-17T00:00:00.000Z",
        updatedAt: "2026-09-18T00:00:00.000Z",
      },
    });
  });

  await updateCustomerProfile({
    profileImage: null,
    serviceTypeIds: ["HOME"],
    region: "서울",
    name: "김지훈2",
    email: "customer@example.com",
    phone: "01012345678",
    currentPassword: "OldPassword1!",
    newPassword: "NewPassword2!",
    newPasswordConfirm: "NewPassword2!",
    changedFields: {
      name: false,
      email: false,
      phone: false,
      serviceTypeIds: false,
      region: false,
    },
  });
});

test("일반 유저는 새 비밀번호 없이도 현재 비밀번호를 프로필 수정 API에 전달한다", async () => {
  mock.method(globalThis, "fetch", async (_input: RequestInfo | URL, options: RequestInit) => {
    assert.ok(options.body instanceof FormData);
    assert.equal(options.body.get("currentPassword"), "CurrentPassword1!");
    assert.equal(options.body.has("newPassword"), false);
    assert.equal(options.body.get("region"), "경기");
    return success({
      profile: {
        id: "customer-profile-1",
        name: "김지훈2",
        email: "customer@example.com",
        phone: "01012345678",
        profileImageUrl: null,
        serviceTypes: ["HOME"],
        region: "경기",
        createdAt: "2026-09-01T00:00:00.000Z",
        updatedAt: "2026-09-19T00:00:00.000Z",
      },
    });
  });

  await updateCustomerProfile({
    profileImage: null,
    serviceTypeIds: ["HOME"],
    region: "경기",
    name: "김지훈2",
    email: "customer@example.com",
    phone: "01012345678",
    currentPassword: "CurrentPassword1!",
    newPassword: "",
    newPasswordConfirm: "",
    changedFields: {
      name: false,
      email: false,
      phone: false,
      serviceTypeIds: false,
      region: true,
    },
  });
});

test("일반 유저는 비밀번호 없이 서비스와 거주지만 수정할 수 있다", async () => {
  mock.method(globalThis, "fetch", async (_input: RequestInfo | URL, options: RequestInit) => {
    assert.ok(options.body instanceof FormData);
    assert.deepEqual(options.body.getAll("serviceTypes"), ["SMALL", "OFFICE"]);
    assert.equal(options.body.get("region"), "경기");
    assert.equal(options.body.has("currentPassword"), false);
    assert.equal(options.body.has("newPassword"), false);
    assert.equal(options.body.has("name"), false);
    return success({
      profile: {
        id: "customer-profile-1",
        name: "김지훈2",
        email: "customer@example.com",
        phone: "01012345678",
        profileImageUrl: null,
        serviceTypes: ["SMALL", "OFFICE"],
        region: "경기",
        createdAt: "2026-09-17T00:00:00.000Z",
        updatedAt: "2026-09-19T00:00:00.000Z",
      },
    });
  });

  await updateCustomerProfile({
    profileImage: null,
    serviceTypeIds: ["SMALL", "OFFICE"],
    region: "경기",
    name: "김지훈2",
    email: "customer@example.com",
    phone: "01012345678",
    currentPassword: "",
    newPassword: "",
    newPasswordConfirm: "",
    changedFields: {
      name: false,
      email: false,
      phone: false,
      serviceTypeIds: true,
      region: true,
    },
  });
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

test("기사님은 소개 정보 재전송 없이 서비스와 활동 지역만 수정할 수 있다", async () => {
  mock.method(globalThis, "fetch", async (_input: RequestInfo | URL, options: RequestInit) => {
    assert.ok(options.body instanceof FormData);
    assert.deepEqual(options.body.getAll("serviceTypes"), ["HOME"]);
    assert.deepEqual(options.body.getAll("regions"), ["서울", "경기"]);
    assert.equal(options.body.has("nickname"), false);
    assert.equal(options.body.has("careerYears"), false);
    assert.equal(options.body.has("shortIntroduction"), false);
    assert.equal(options.body.has("description"), false);
    return success({
      profile: {
        id: "mover-profile-1",
        profileImageUrl: null,
        nickname: "김기사",
        careerYears: 7,
        shortIntroduction: "안전하게 옮겨드립니다.",
        description: "상세 소개입니다.",
        serviceTypes: ["HOME"],
        regions: ["서울", "경기"],
        createdAt: "2026-09-17T00:00:00.000Z",
        updatedAt: "2026-09-19T00:00:00.000Z",
      },
    });
  });

  await updateMoverProfile({
    profileImage: null,
    nickname: "김기사",
    careerYears: "7",
    shortIntroduction: "안전하게 옮겨드립니다.",
    description: "상세 소개입니다.",
    serviceTypeIds: ["HOME"],
    regions: ["서울", "경기"],
    changedFields: {
      nickname: false,
      careerYears: false,
      shortIntroduction: false,
      description: false,
      serviceTypeIds: true,
      regions: true,
    },
  });
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

test("기사님 기본정보는 이메일과 전화번호를 검증 기준으로 정규화한다", async () => {
  mock.method(globalThis, "fetch", async (_input: RequestInfo | URL, options: RequestInit) => {
    const payload: unknown = JSON.parse(String(options.body));
    assert.deepEqual(payload, {
      name: "기사님",
      email: "mover@example.com",
      phone: "01012345678",
    });
    return success({ basicInfo: { name: "기사님", email: "mover@example.com", phone: "01012345678" } });
  });

  const basicInfo = await updateMoverBasicInfo({
    name: "기사님",
    email: "MOVER@example.com",
    phone: "010.1234.5678",
    currentPassword: "",
    newPassword: "",
    newPasswordConfirm: "",
  });
  assert.equal(basicInfo.email, "mover@example.com");
  assert.equal(basicInfo.phone, "01012345678");
});

test("기사님 비밀번호 변경은 수정하지 않은 기존 기본정보를 다시 전송하지 않는다", async () => {
  mock.method(globalThis, "fetch", async (_input: RequestInfo | URL, options: RequestInit) => {
    assert.deepEqual(JSON.parse(String(options.body)), {
      currentPassword: "OldPassword1!",
      newPassword: "NewPassword2!",
    });
    return success({ basicInfo: { name: "김기사2", email: "mover@example.com", phone: "01012345678" } });
  });

  await updateMoverBasicInfo({
    name: "김기사2",
    email: "mover@example.com",
    phone: "01012345678",
    currentPassword: "OldPassword1!",
    newPassword: "NewPassword2!",
    newPasswordConfirm: "NewPassword2!",
    changedFields: { name: false, email: false, phone: false },
  });
});

test("기사님은 새 비밀번호 없이도 현재 비밀번호를 기본정보 수정 API에 전달한다", async () => {
  mock.method(globalThis, "fetch", async (_input: RequestInfo | URL, options: RequestInit) => {
    assert.deepEqual(JSON.parse(String(options.body)), {
      name: "새 이름",
      currentPassword: "CurrentPassword1!",
    });
    return success({
      basicInfo: {
        name: "새 이름",
        email: "mover@example.com",
        phone: "01012345678",
      },
    });
  });

  await updateMoverBasicInfo({
    name: "새 이름",
    email: "mover@example.com",
    phone: "01012345678",
    currentPassword: "CurrentPassword1!",
    newPassword: "",
    newPasswordConfirm: "",
    changedFields: { name: true, email: false, phone: false },
  });
});
