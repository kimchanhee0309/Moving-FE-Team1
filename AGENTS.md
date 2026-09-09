# Moving FE Team 1 - AI 작업 규칙

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

이 파일은 저장소 전체에 적용한다. 어떤 AI 도구를 사용하더라도 작업 전 저장소 루트, 현재 브랜치, 이 파일의 절대경로를 확인하고 처음부터 끝까지 직접 읽는다. 하위 폴더에 더 가까운 `AGENTS.md`가 있다면 함께 적용하되, 이 파일을 우회하는 지침을 만들지 않는다.

## 0. AGENTS.md 보호

- 사용자가 현재 요청에서 명시적으로 허용하지 않으면 이 파일을 수정·이동·삭제·이름 변경하지 않는다.
- 규칙 충돌이나 개선 필요는 코드 변경과 분리해 보고한다. 허용받은 경우에도 요청 범위만 최소 수정한다.
- `AGENTS.override.md`나 도구별 파일을 만들어 규칙을 우회하지 않는다.
- 공용 규칙 변경은 별도 PR과 팀 리뷰를 거친다.
- 수정 후 UTF-8 파일 크기를 확인하고 Codex 기본 로딩 한도인 32KiB 미만을 유지한다. 반복 예시는 줄이고 핵심 규칙을 앞쪽에 둔다.

## 1. 프로젝트와 용어

`무빙(Moving)`은 이사 소비자와 이사 전문가를 연결하는 견적 매칭 서비스다.

- `CUSTOMER`: 화면에서는 `일반 유저`, 코드·경로에서는 `customer`
- `MOVER`: 화면에서는 `기사님`, 코드·경로에서는 `mover`
- 비회원: 랜딩과 기사님 목록·상세 조회 가능
- 같은 개념에 `driver`, `provider` 등 새 명칭을 임의로 추가하지 않는다.

## 2. 판단 우선순위

충돌 시 다음 순서로 판단하고 충돌·선택 근거를 결과에 남긴다.

1. 현재 사용자의 명시적 요청과 인수 조건
2. 최신 기능 요구사항, Figma, Swagger/API 명세, 백엔드 스키마
3. 이 문서
4. 현재 저장소 설정과 구현 패턴
5. 팀 Notion의 무빙 문서
6. 교안·다른 프로젝트 예시

저장소에서 확인 가능한 사실은 직접 확인한다. 불명확한 API 필드·Figma 수치·권한 규칙을 추측하지 않는다. 포토카드·마켓플레이스·`Grade`·`shopListing`·`exchange`·프론트 Prisma 등 다른 프로젝트 예시는 도입하지 않는다.

## 3. 작업 시작 전 필수 확인

코드 수정 전에 다음을 순서대로 수행한다.

1. `git rev-parse --show-toplevel`, `git status`로 저장소 루트·브랜치·기존 변경을 확인한다.
2. `package.json`, `tsconfig.json`, 관련 Next.js 로컬 문서와 대상 페이지·feature·common 코드를 읽는다.
3. 기존 공통 컴포넌트, 아이콘·이미지, typography, hook, type, API, 상수를 검색한다.
4. 사용자 유형, 라우트, API 계약, loading·empty·error 상태와 담당 범위를 정리한다.
5. Figma/API/권한이 모호하거나 다른 담당 파일 변경이 필요하면 구현 전 확인한다.

사용자의 미완성 변경을 덮거나 되돌리지 않는다. 관련 없는 정리·대규모 리팩터링·전역 변경은 하지 않으며 범위 밖 오류는 보고만 한다.

## 4. 기술 스택

- Next.js 16 App Router, React 19
- TypeScript 5 (`strict: true`)
- Tailwind CSS 4, CSS 디자인 토큰, Pretendard Variable
- TanStack Query 5, REST API, 공통 `apiClient`
- npm + `package-lock.json`
- AWS 배포 예정

정확한 버전과 script는 `package.json`·lockfile을 기준으로 한다. `react-router`를 사용하지 않는다. `clsx`, `tailwind-merge`, `vaul`, `react-intersection-observer` 등 미설치 패키지를 승인 없이 추가하지 않는다. 새 lockfile이나 패키지 매니저를 도입하지 않는다. PostgreSQL/Prisma는 백엔드 전용이다.

## 5. 폴더와 책임 경계

```text
public/                  정적 이미지·폰트·아이콘
src/app/(public)/        랜딩, 기사님 찾기·상세
src/app/(auth)/          customer/mover 로그인·회원가입
src/app/(customer)/      customer-profile, move-request, customer-quote, favorite, review
src/app/(mover)/         mover-profile, mover-mypage, requests, mover-quote
src/common/              여러 도메인이 공유하는 API·컴포넌트·hook·상수·유틸
src/features/            auth 및 기능 단위 모듈
src/providers/           전역 Provider
src/styles/              전역 토큰·타이포그래피·reset
```

- `page.tsx`는 기본적으로 데이터·레이아웃 조합만 담당한다. 한 페이지 전용 UI는 라우트 `_components`, 도메인 내 재사용 UI는 `features/{feature}/components`, 여러 도메인 공통 UI만 `common/components`에 둔다. 단, 재사용되지 않는 단순 페이지를 `page.tsx`에 직접 두라는 명시적 팀 리뷰가 있으면 그 지시를 우선한다.
- `common`은 feature를 import하지 않는다. feature 간 직접 의존을 피하고 공통 계약만 추출한다.
- `shared`, `lib`, `services` 같은 중복 최상위 계층을 만들지 않는다.
- 라우트 그룹은 URL에 포함되지 않는다. 라우트 추가·변경 시 `src/common/constants/routes.ts`도 확인하며 모든 경로는 `/`로 시작한다.
- 새 `src` 코드는 `.ts`/`.tsx`로 작성한다. JSX는 `.tsx`, 그 외 API·type·상수·hook·utility는 `.ts`를 사용한다. 컴포넌트는 `PascalCase.tsx`, hook은 `useSomething.ts`, API/type은 `feature-name.api.ts`/`feature-name.types.ts`를 따른다.
- 주요 feature 이름은 `auth`, `customer-profile`, `customer-quote`, `favorite`, `move-request`, `mover-mypage`, `mover-profile`, `mover-quote`, `mover-requests`, `mover-search`, `notification`, `review`로 유지한다.

### 담당 영역

| 영역 | 주요 경로 | 담당 |
| --- | --- | --- |
| 인증/랜딩 | `(auth)`, `(public)/page.tsx`, `features/auth` | 이승재 |
| 프로필/기사님 마이페이지 | customer/mover profile, mover mypage | 김지훈 |
| 견적 요청/GNB/알림 | `move-request`, `notification`, 공통 Header | 노진우 |
| 기사님 찾기/상세 | `mover-search` | 이영주 |
| 찜/리뷰 | `favorite`, `review` | 조민성 |
| 일반 유저 견적 | `customer-quote` | 권태현 |
| 기사님 요청/견적 | `mover-requests`, `mover-quote` | 김찬희 |

다른 담당자의 공통 컴포넌트·연동 파일을 바꿔야 하면 Figma/API를 MCP 또는 팀 지정 도구로 먼저 확인한다. 결과에 확인 자료, 변경 이유, 영향받는 사용처, 담당자 협의 사항을 분리해 적는다. 계약이 미확정이거나 다른 작업을 덮을 위험이 있으면 수정하지 않는다.

## 6. 공통 컴포넌트

- 새 UI 전 `src/common/components` → feature `components` → 라우트 `_components` 순으로 검색하고 기존 요소를 재사용한다.
- 공통화 후보는 GNB/Header, Input·Select·Dropdown, 주소/우편번호·달력, 견적 관련 카드·모달·SubHeader, 공통 제목·별점·찜·상태 라벨이다. 필요성과 실제 재사용이 있을 때만 만든다.
- 공통 컴포넌트는 API 호출이나 페이지 라우팅을 소유하지 않는다. 값을 controlled props로 받고 행동은 callback으로 전달한다.
- native props, `className`, disabled, loading, error와 접근성을 지원한다. Input은 label/error와 비밀번호 보기 기능을 일관되게 제공한다.
- variant·size는 union type과 컴포넌트 밖 매핑으로 관리한다. 디자인 값은 토큰·variant에 모은다.
- public props 변경 전 전체 사용처를 검색하고 하위 호환성을 확인한다.

## 7. TypeScript, React, Next.js, 상태

### TypeScript

- `any`, `@ts-ignore`, 근거 없는 type assertion을 사용하지 않는다.
- API 응답, props, hook 반환값을 명시적으로 타입화하고 type-only import는 `import type`을 사용한다.
- 백엔드 enum은 common 또는 feature 상수/type 한 곳에서 관리한다.
- 서버 필드를 임의로 바꾸지 말고 변환은 API mapper에 둔다. null, undefined, 빈 배열을 구분한다.

### React/Next.js

- Server Component가 기본이다. state·effect·event·브라우저 API·TanStack Query가 필요한 최소 경계만 `"use client"`로 만든다.
- 라우팅은 `next/link`, `next/navigation`을 사용한다.
- page/layout만 기본 export하고 재사용 코드에는 named export를 우선한다.
- 파생 상태를 별도 state로 저장하지 않는다. `useEffect`는 외부 시스템 동기화에만 쓴다.
- 목록 key는 안정적인 식별자를 사용한다. 이미지에는 적절한 `alt`와 가능한 경우 `next/image`를 사용한다.
- normal/loading/empty/error/success 상태를 구현하고 작은 갱신에는 기존 데이터를 유지한다.

### TanStack Query

- 서버 상태는 Query, 컴포넌트 UI 상태는 local state로 관리한다. Context는 공유 인증·모달·알림에 한해 검토한다.
- API 함수는 `.api.ts`, Query/Mutation 조합은 feature `hooks`에 두며 화면에서 직접 `fetch`하지 않는다.
- query key는 feature factory로 일관되게 관리한다. mutation 성공 후 정확한 캐시 갱신·무효화를 수행한다.
- optimistic update는 rollback이 있을 때만 사용한다.

## 8. 네이밍, 스타일, 주석

- 컴포넌트·type·interface: `PascalCase`; 변수·함수: `camelCase`; 상수: `UPPER_SNAKE_CASE`; 폴더: `kebab-case`.
- hook은 `useSomething`, event prop은 `onSubmit`, 내부 handler는 `handleSubmit`, boolean은 `is/has/can/should` 접두사를 사용한다.
- double quote, semicolon, trailing comma와 `@/*` alias를 사용한다. import는 외부 → `@/` → 상대 경로 순이다.
- 디버그 로그, 미사용 코드·import, 코드 내용을 반복하는 주석은 남기지 않는다.
- 재사용 컴포넌트·hook·API·mapper·validator에는 책임과 비책임, public props 계약을 필요한 만큼 설명한다.
- Figma 고정값, breakpoint, 토큰 매핑, API 변환, 권한·수량·날짜 제한, 캐시·race·focus·aria처럼 이유가 숨은 로직에만 근거와 예외를 주석으로 남긴다.
- 상태 우선순위가 있으면 분기 가까이에 설명한다. `TODO`에는 확인 자료·담당·제거 조건을 적고 민감정보를 포함하지 않는다. 코드와 주석을 함께 갱신한다.

## 9. 디자인과 반응형

- `src/styles/colors.css`, `typography.css`, `reset.css`를 기준으로 CSS 변수와 typography class를 우선 사용한다.
- 이미지·아이콘 추가 전 `public`을 검색한다. 같은 자산은 재사용하고 새 자산은 작업 전용 하위 폴더에 둔다.
- 임의 hex·중복 font-size·새 팔레트를 반복 추가하지 않는다. 공용 typography 추가와 Tailwind v4 `@theme` 이전은 팀 합의가 필요하다.
- Figma의 Auto Layout, 크기, 간격, 색상, 폰트, radius와 실제 프레임을 확인한다.
- 공통 viewport: 모바일 `375~743px`, 태블릿 `744~1199px`, 데스크톱 `1200px 이상`. `375px 미만`은 모바일 레이아웃을 유지하고 넘침·잘림만 방지한다.
- Tailwind는 필요 시 `min-[744px]`, `min-[1200px]`를 사용하며 기본 `md/lg`와 같다고 가정하지 않는다. 별도 breakpoint에는 Figma 근거를 주석으로 남긴다.
- 최소 375, 744, 1200px에서 검증한다. overlay/modal은 GNB보다 위에 두되 z-index 경쟁을 만들지 않는다.
- PC 기사님 찾기의 찜한 기사님은 최대 3명이다.

## 10. 접근성과 폼

- 클릭은 의미에 맞는 `button`/`a`를 사용하고 모든 폼 요소에 연결된 label, 오류, disabled/loading 상태를 제공한다.
- 모달은 제목, focus 이동·복귀, Esc와 backdrop 닫기 정책을 정의한다.
- 아이콘 버튼은 `aria-label`을 갖고 주요 UI는 키보드만으로 사용할 수 있어야 한다.
- 선택·오류·지정 요청을 색상만으로 전달하지 않는다.
- 이메일은 일반 형식, 전화번호는 한국 형식으로 검증하고 표시값과 서버값을 일관되게 정규화한다.
- 비밀번호는 8자 이상이며 영문·숫자·특수문자를 각각 하나 이상 포함한다.
- 클라이언트 검증과 서버 오류를 구분해 구체적인 한국어 메시지를 표시한다.

## 11. API와 데이터

- 모든 REST 호출은 `src/common/api/client.ts`의 `apiClient`와 `NEXT_PUBLIC_API_URL`을 사용하고 `credentials: "include"`를 유지한다.
- 기본 응답은 성공 `{ success: true, data }`, 실패 `{ success: false, error: { code, message } }`지만 구현 전 Swagger와 실제 응답을 확인한다.
- 오류는 `ApiError`, query string은 `apiClient.query`로 처리한다. `FormData`에는 `Content-Type`을 직접 설정하지 않는다.
- 토큰·cookie·주소·전화번호를 로그에 남기지 않고 `.env*`를 커밋하지 않는다.
- Notion API는 `To Do`와 오탈자가 있으므로 아래 경로도 후보일 뿐이다. method/path/request/response를 최신 Swagger·백엔드에서 확정한 뒤 구현한다.

| 도메인 | 후보 API |
| --- | --- |
| Auth | signup/login/refresh/logout, `/auth/oauth/:provider`, callback |
| Mover search | `GET /movers`, `/movers/:id`, `/reviews/:moverId` |
| Move request | `POST /move-request` |
| Customer quote | 목록·상세·확정·이력 |
| Mover requests/quote | `/movers/me/received-requests`, 견적·반려·상세 |
| Customer profile | `POST/GET/PATCH /customers/me/profile`, `GET/PATCH /customers/me` |
| Mover profile | `POST/GET/PATCH /movers/me/profile`, `GET/PATCH /movers/me` |
| Favorites/Reviews | 목록·등록·해제 계약 확인, `POST /reviews`, `/movers/me/reviews` |
| Notification | 문서화 전 임의 endpoint 생성 금지 |

`auth/signup/userss`, 로그인으로 적힌 `POST auth/me`, 대상 없는 `DELETE /favorites`, `reviews?type=writable, me`는 확정 계약으로 쓰지 않는다. 프론트 타입은 ERD 테이블을 복제하지 말고 API DTO에 맞춘다.

## 12. 사용자 흐름과 비즈니스 규칙

### 인증·프로필

- customer/mover 인증 화면과 권한을 분리하고 이메일 및 Google/Naver/Kakao OAuth, 로그아웃을 지원한다.
- 인증 여부와 별도로 role과 profile 등록 여부를 확인한다. 미등록 사용자는 역할 전용 기능에 접근할 수 없다.
- 비회원이 인증 필요 행동을 누르면 역할별 로그인으로 보내고 원래 목적지를 `redirect`로 보존한다.
- 일반 유저: 가입/첫 로그인 → 미등록이면 `/customer-profile/register` → GNB에서 `/customer-profile/edit`.
- 기사님: 가입/첫 로그인 → 미등록이면 `/mover-profile/register` → `/mover-mypage`; 수정은 `/mover-profile/edit`, 기본정보는 `/mover-mypage/basic-info`.
- 프로필 필드는 역할별 Figma/API를 확인한다. customer와 mover가 같은 필드라고 추측하지 않는다.
- 페이지 구현에서 인증 hook, TanStack Query 전역 설정, 공통 API client를 담당자 협의 없이 수정하지 않는다.

### 견적 요청

- customer는 동시에 하나의 활성 요청만 가진다. 확정 전 대기 요청과 확정 후 이사일 이전 요청을 포함하며 이사일 이후 새 요청이 가능하다.
- 일반 견적 최대 5명, 지정 견적 최대 3명, 총 최대 8개다. 지정 요청은 일반 요청 완료 후 가능하고 라벨로 강조한다.
- 흐름은 이사 종류 → 이사 예정일 → 주소이며 progress bar를 표시한다. 이전 단계 수정 시 이후 상태와 payload 일관성을 유지한다.
- 주소는 카카오 우편번호 공통 modal/adapter로 입력한다.

### 기사님 찾기·견적·리뷰·알림

- 비회원/customer가 기사님 목록·상세·리뷰·평점을 조회할 수 있다. 검색, 리뷰·평점·경력·확정 횟수 정렬, 지역·서비스 필터와 초기화를 제공한다.
- 기사님 목록은 무한 스크롤이며 검색·정렬·필터를 query key에 포함한다. 조건 변경 시 첫 페이지부터 조회하고 중복·마지막 페이지 이후 요청·race를 막는다.
- mover는 가능 지역 요청만 보고 지정 요청을 강조하며 견적 또는 반려할 수 있다. 요청은 유형·지역·지정 여부 필터와 이사일순·최근순 정렬을 지원하고 반려 목록을 유지한다.
- 받은 견적은 지정 여부를 구분하고 찜·상세·확정을 제공한다. 완료 이력은 전체/확정 견적을 구분한다.
- 리뷰는 이사 완료 후 확정 기사님에게만 작성한다. 기사님 목록은 무한 스크롤, 리뷰 목록은 pagination을 사용한다.
- customer는 작성 가능/완료 리뷰와 찜 전체 목록을 보고, mover 마이페이지는 평점과 받은 리뷰를 보여준다.
- 알림: customer는 새 견적·견적 확정·이사 당일, mover는 새 요청·견적 확정·이사 당일.
- 제한은 서버도 검증해야 하며 401/403/409와 도메인 오류를 처리한다.

## 13. Git, 브랜치, PR

- 기준 `dev`, 배포 `main`, 기능 `feat/<lowercase-kebab-case>`, 흐름 `feat/* → dev → main`.
- 최신 `dev`에서 분기한다. 최신화는 원칙적으로 rebase지만 AI가 사용자 변경을 임의 stash/reset하지 않는다.
- 사용자의 별도 허용 없이 commit, push, PR, merge, rebase, 배포를 수행하지 않는다.
- 커밋은 `feat|fix|refactor|docs|chore: 설명` 형식으로 논리 변경 하나만 담는다.
- PR 대상은 `dev`; 이슈·작업·검증·UI 스크린샷·리뷰 포인트를 적고 2명 이상 Approve 후 Squash and merge한다.
- 충돌은 자신의 feature 브랜치에서 해결하고 팀에 알린다.
- `git push --force`, `git reset --hard`는 금지한다. rebase한 자신의 브랜치도 팀 동의와 원격 확인 후에만 `--force-with-lease`를 검토한다.
- 브랜치 삭제, 사용자 변경 삭제, 대량 이동은 명시적 요청 없이 하지 않는다.

## 14. 검증과 완료 기준

실제 `package.json` script를 먼저 확인한 뒤 최소 다음을 실행한다.

```bash
npm run lint
npx tsc --noEmit
```

배포 영향 변경은 필요한 환경변수와 함께 `npm run build`도 실행한다. 현재 실제 테스트 환경은 없으므로 빈 `test.tsx`를 테스트로 보고하지 않는다.

UI는 관련 역할과 375/744/1200px에서 normal/loading/empty/error, 로그인·role·profile 상태, 키보드/focus, 긴 문구·작은 화면, 검색·필터, 마지막 페이지, 중복 제출과 실패 복구를 작업 범위에 맞게 확인한다.

실패를 성공으로 표현하지 않는다. 명령, 결과, 기존 문제·환경 부족·이번 변경의 관련성을 구분한다. 마지막으로 변경 파일이 담당 범위와 일치하는지 확인한다.

## 15. 완료 보고

짧고 구체적으로 다음을 보고한다.

1. 생성·수정·삭제한 파일과 구현 기능
2. 재사용한 공통 컴포넌트와 상태·반응형 결과
3. 실행한 lint·TypeScript·build·브라우저 검증과 결과
4. API/Figma 의존성, 남은 위험과 팀 협의 사항
5. 담당 범위 밖이라 수정하지 않은 사항

작업하지 않은 기능을 구현했다고 말하지 않는다. mock·임시 데이터·TODO를 남겼다면 위치와 이유를 명시한다.
