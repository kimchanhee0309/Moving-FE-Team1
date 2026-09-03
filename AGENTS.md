## 0. AGENTS.md 보호 규칙

이 파일은 팀이 합의하고 교차 검증한 공용 규칙이므로 AI 작업 중에는 **읽기 전용 파일**로 취급한다.

- 사용자가 현재 요청에서 `AGENTS.md` 수정을 명시적으로 지시하지 않았다면 이 파일을 수정, 이동, 이름 변경, 삭제하지 않는다.
- 기능 구현, 리팩터링, 오류 수정, 규칙 적용 요청은 `AGENTS.md` 수정 권한을 포함하지 않는다.
- 기존 규칙이 작업을 어렵게 하거나 서로 충돌해도 AI가 임의로 완화·삭제·우회하지 않는다.
- 규칙의 누락, 충돌, 개선 필요성을 발견하면 코드 변경과 분리하여 사용자에게 보고하고 수정 제안만 한다.
- 사용자가 명시적으로 수정을 요청한 경우에도 요청된 범위만 최소 변경하고, 변경 이유와 영향을 보고한다.
- `AGENTS.override.md`, 하위 폴더의 별도 `AGENTS.md`, AI 도구별 지침 파일을 만들어 이 규칙을 우회하지 않는다.
- 팀 공용 규칙 변경은 별도 PR과 팀 리뷰를 거쳐 반영한다.

## 1. 프로젝트 목표

`무빙(Moving)`은 이사 소비자와 이사 전문가를 연결하는 견적 매칭 서비스다.

- `CUSTOMER`: 일반 유저/소비자
- `MOVER`: 기사님/이사 전문가
- 비회원: 기사님 목록과 상세 정보만 조회 가능
- 서비스의 핵심 가치는 견적·리뷰·평점·경력 정보를 투명하게 제공하여 신뢰할 수 있는 매칭을 만드는 것이다.

코드, 타입, 경로에서는 `customer`, `mover`를 사용한다. 사용자 화면의 한국어 문구에서는 각각 `일반 유저`, `기사님`을 사용한다. 같은 개념에 `user`, `driver`, `provider` 같은 새 명칭을 임의로 추가하지 않는다.

## 2. 작업 판단 기준

### 우선순위

서로 다른 자료가 충돌하면 다음 순서로 판단한다.

1. 현재 작업 요청과 명시된 인수 조건
2. 무빙 기능 요구사항, 최신 Figma, Swagger/API 명세, 백엔드 스키마
3. 이 `AGENTS.md`
4. 현재 저장소의 실제 설정과 구현 패턴
5. 팀 Notion의 무빙 전용 문서
6. 교안이나 다른 프로젝트의 예시 코드

원하는 동작은 요구사항/Figma/Swagger를 따르고, 설치 여부·파일 위치·사용 가능한 명령처럼 현재 상태에 관한 사실은 저장소를 직접 확인한다. 충돌을 발견하면 추측으로 섞지 말고 작업 결과에 충돌 내용과 선택한 기준을 남긴다.

### 레거시 예시 주의

팀 문서 일부에는 포토카드, 마켓플레이스, 배스킨라빈스 폰트, `Grade`, `shopListing`, `exchange`, Prisma를 프론트에서 직접 사용하는 예시가 섞여 있다. 이는 무빙의 요구사항이 아니므로 복사하거나 새 코드에 도입하지 않는다.

- 폴더명은 `src/shared`가 아니라 현재 저장소의 `src/common`을 사용한다.
- 이 프로젝트는 TypeScript 프로젝트다. API 파일은 `.api.js`가 아니라 `.api.ts`를 사용한다.
- Next.js App Router를 사용한다. 설치 목록에 있더라도 `react-router`로 라우팅하지 않는다.
- `clsx`, `tailwind-merge`, `vaul`, `react-intersection-observer`는 문서에 언급되지만 현재 설치되어 있지 않다. 팀 승인 없이 import하거나 의존성을 추가하지 않는다.
- PostgreSQL/Prisma는 백엔드 기술이다. 프론트엔드에서 Prisma 모델이나 DB에 직접 접근하지 않는다.

## 3. 작업 시작 전 필수 확인

코드를 수정하기 전에 다음 순서로 확인한다.

1. `git status`로 현재 브랜치와 기존 변경 사항을 확인한다.
2. `package.json`, `tsconfig.json`, 관련 페이지·feature·common 코드를 읽는다.
3. 같은 역할의 공통 컴포넌트, 훅, 타입, API 함수, 상수가 이미 있는지 검색한다.
4. 작업이 영향을 주는 유저 타입, 라우트, API 계약, 로딩/빈 값/오류 상태를 정리한다.
5. API 필드·Figma 수치·권한 규칙이 불명확하면 임의의 계약을 만들지 말고 확인을 요청한다.

사용자의 미완성 변경을 덮어쓰거나 되돌리지 않는다. 관련 없는 파일을 정리하거나 대규모 리팩터링하지 않는다. 작업 범위를 벗어난 오류는 결과에 별도로 보고하고, 요청 없이 함께 수정하지 않는다.

## 4. 현재 기술 스택

- Next.js 16 App Router
- React 19
- TypeScript 5, `strict: true`
- Tailwind CSS 4
- TanStack Query 5
- REST API + 공통 `apiClient`
- CSS 디자인 토큰 + Pretendard Variable
- npm + `package-lock.json`
- Vercel 배포 예정

정확한 버전은 항상 `package.json`과 lockfile을 기준으로 한다. 기존 패키지로 해결할 수 있는 작업에 새 라이브러리를 추가하지 않는다. 의존성 추가·삭제·대규모 버전 변경은 요청 또는 팀 합의가 있을 때만 수행하고 이유와 영향을 PR에 적는다. npm을 사용하며 다른 패키지 매니저의 lockfile을 만들지 않는다.

## 5. 폴더와 책임 경계

```
src/
├─ app/                         # App Router 라우트와 얇은 페이지 조합
│  ├─ (public)/
│  ├─ (auth)/
│  ├─ (customer)/
│  └─ (mover)/
├─ common/
│  ├─ api/                     # apiClient, 공통 응답/오류 타입
│  ├─ auth/                    # 인증 공통 타입과 로직
│  ├─ components/              # 도메인에 종속되지 않는 공통 UI
│  ├─ constants/               # 라우트, 환경변수, 공통 enum 상수
│  ├─ hooks/                   # 두 개 이상 도메인에서 재사용하는 훅
│  └─ utils/                   # 순수 공통 함수
├─ features/
│  └─ {feature-name}/
│     ├─ components/           # 해당 도메인에서 재사용하는 UI
│     ├─ hooks/                # 해당 도메인의 Query/Mutation/UI 훅
│     ├─ {feature-name}.api.ts
│     ├─ {feature-name}.types.ts
│     └─ {feature-name}.utils.ts
├─ providers/                  # 앱 전역 Provider
└─ styles/                     # reset, color, typography 등 전역 토큰
```

- `page.tsx`는 데이터·레이아웃 조합만 담당하고 큰 UI와 비즈니스 로직을 담지 않는다.
- 한 페이지에서만 쓰는 컴포넌트는 해당 라우트의 `_components`에 둔다.
- 특정 도메인의 여러 페이지에서 재사용하면 `features/{feature}/components`에 둔다.
- 도메인과 무관하게 여러 feature에서 재사용할 때만 `common/components`로 승격한다.
- `common`이 feature를 import하지 않게 한다. feature 간 직접 의존도 피하고 공통 계약을 `common`으로 추출한다.
- 새 최상위 폴더나 `shared`, `lib`, `services` 같은 중복 계층을 임의로 만들지 않는다.
- 라우트 그룹 `(public)`, `(auth)`, `(customer)`, `(mover)`는 URL에 포함되지 않는다.
- 파일 시스템 라우트와 `src/common/constants/routes.ts`를 함께 갱신하고 오탈자를 검증한다. 경로는 항상 `/`로 시작한다.

### 폴더별 TypeScript 파일 규칙

`src` 아래의 애플리케이션 코드는 JavaScript가 아닌 TypeScript로 작성한다. 새 `.js`/`.jsx` 파일을 만들거나 TypeScript 파일을 JavaScript로 변환하지 않는다.

| 위치/역할                     | 확장자와 예시                                                         |
| ----------------------------- | --------------------------------------------------------------------- |
| App Router 페이지/레이아웃    | `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx` |
| React 컴포넌트                | `PascalCase.tsx`                                                      |
| React Context/Provider        | `SomethingProvider.tsx` 또는 기존 provider 네이밍을 따른 `.tsx`       |
| JSX를 반환하는 hook           | 꼭 필요한 경우에만 `useSomething.tsx`                                 |
| 일반 custom hook              | `useSomething.ts`                                                     |
| API 함수                      | `{feature-name}.api.ts`                                               |
| DTO/props/domain 타입         | `{feature-name}.types.ts` 또는 목적이 분명한 `types.ts`               |
| Query key, 상수               | `{feature-name}.constants.ts` 또는 기존 `constants/*.ts`              |
| validator/mapper/순수 utility | `.ts`                                                                 |
| 전역·디자인 스타일            | `.css`                                                                |

- JSX 문법이 있으면 `.tsx`, JSX 문법이 없으면 `.ts`를 사용한다.
- 브라우저에서 실행된다는 이유만으로 `.tsx`를 사용하지 않는다. React element/JSX 포함 여부로 구분한다.
- route 파일명은 Next.js 예약 이름을 유지하고, 그 외 컴포넌트 파일은 `PascalCase.tsx`를 사용한다.
- API, type, constant, utility 파일에서 React를 import하지 않는다.
- 루트 설정 파일인 `eslint.config.mjs`, `postcss.config.mjs`, `next.config.ts`는 프론트 소스 확장자 규칙의 예외다.
- `tsconfig.json`의 현재 `allowJs` 값과 무관하게 새 `src` 코드는 `.ts`/`.tsx`로 작성하고 `strict: true`를 유지한다. 설정 변경이 필요하면 팀과 먼저 논의한다.

현재 주요 feature 이름은 다음을 유지한다.

`auth`, `customer-profile`, `customer-quote`, `favorite`, `move-request`, `mover-mypage`, `mover-profile`, `mover-quote`, `mover-requests`, `mover-search`, `notification`, `review`

### 현재 협업 담당 영역

담당 변경에 대한 별도 지시가 없다면 다른 영역까지 불필요하게 수정하지 않는다.

| 영역                     | 주요 경로                                      | 담당   |
| ------------------------ | ---------------------------------------------- | ------ |
| 인증/랜딩                | `(auth)`, `(public)/page.tsx`, `features/auth` | 이승재 |
| 프로필/기사님 마이페이지 | customer/mover profile, mover mypage feature   | 김지훈 |
| 견적 요청/GNB/알림       | `move-request`, `notification`, 공통 Header    | 노진우 |
| 기사님 찾기/상세         | `mover-search`                                 | 이영주 |
| 찜/리뷰                  | `favorite`, `review`                           | 조민성 |
| 일반 유저 견적 관리      | `customer-quote`                               | 권태현 |
| 기사님 요청/견적 관리    | `mover-requests`, `mover-quote`                | 김찬희 |

## 6. 공통 컴포넌트 원칙

새 UI를 만들기 전에 `src/common/components`, 관련 feature의 `components`, 페이지의 `_components` 순서로 검색한다. 비슷한 컴포넌트를 이름만 바꿔 복제하지 않는다.

무빙에서 공통화 대상으로 합의된 UI는 다음과 같다.

- 반응형 GNB/Header
- Input 계열과 폼용 SelectInput, 정렬/필터용 Dropdown
- 주소 카드와 카카오 우편번호 검색 모달
- 달력/날짜 선택 UI
- 견적 요청·대기 견적·과거 견적·받은 요청·반려 요청·이사 완료 카드
- 견적 보내기/요청 반려 모달
- 이사 유형·신청일·출발지·도착지·이사일을 보여주는 SubHeader
- 공통 타이틀, 별점, 찜 버튼, 상태/지정 요청 라벨

목록은 “미리 전부 구현하라”는 의미가 아니다. 현재 작업에서 필요하고 재사용성이 확인된 경우에만 구현한다.

- 공통 컴포넌트는 API 호출이나 특정 페이지 라우팅을 직접 소유하지 않는다.
- 값과 열림 상태는 가능한 한 controlled props로 받고, 행동은 `onChange`, `onClose`, `onSubmit`처럼 콜백으로 전달한다.
- native element props를 적절히 확장하고 `className`, `disabled`, 오류, 로딩 상태를 지원한다.
- Input은 `label`, `error`, `disabled`를 일관되게 표현하고 `type="password"`일 때 접근 가능한 보기/숨기기 기능을 제공한다.
- 정렬/필터 Dropdown과 폼 입력 Select를 같은 컴포넌트의 모호한 모드로 섞지 않는다.
- variant/size가 필요하면 허용 값을 union type과 컴포넌트 밖의 매핑 객체로 정의한다.
- 색상·간격·타이포그래피 값을 호출부마다 복사하지 말고 토큰과 variant에 모은다.
- 기존 공통 컴포넌트의 public props를 바꿀 때는 모든 사용처를 검색하고 하위 호환 여부를 확인한다.

## 7. TypeScript, React, Next.js 규칙

### TypeScript

- `any`, 무분별한 type assertion, `@ts-ignore`를 사용하지 않는다.
- API 응답, 컴포넌트 props, hook 반환값을 명시적으로 타입화한다.
- 타입 전용 import는 `import type`을 사용한다.
- 백엔드 enum 문자열은 `src/common/constants/domain.ts` 또는 feature의 상수/type에서 단일 관리한다.
- 서버 응답 필드를 UI 편의를 위해 임의로 바꾸지 않는다. 변환이 필요하면 API 계층의 mapper에 모은다.
- null/undefined/빈 배열을 구분하고 optional chaining만으로 오류를 숨기지 않는다.

### React/Next.js

- Server Component를 기본값으로 한다.
- state, effect, event handler, 브라우저 API, TanStack Query가 필요한 가장 작은 경계에만 `"use client"`를 둔다.
- 라우팅은 `next/link`, `next/navigation`, App Router를 사용한다.
- 페이지 컴포넌트와 layout만 Next.js 규칙에 따라 default export하고, 재사용 컴포넌트·함수·훅은 named export를 기본으로 한다.
- 파생 가능한 상태를 별도 state로 저장하지 않는다. `useEffect`는 외부 시스템 동기화에만 사용한다.
- list key에 배열 index를 쓰지 말고 안정적인 식별자를 사용한다.
- 이미지에는 의미 있는 `alt`를 제공하고, 최적화가 가능한 정적/원격 이미지는 `next/image` 사용을 우선한다.
- loading, empty, error, success 상태를 모두 구현한다. 화면 전체를 막을 필요가 없는 갱신에는 기존 데이터를 유지한다.

### TanStack Query

- 서버 상태는 TanStack Query로, 컴포넌트 한정 UI 상태는 local state로 관리한다.
- 여러 화면이 공유하는 인증/모달/알림 UI 상태만 Context 사용을 검토한다.
- query key는 feature 안에서 일관된 factory 형태로 관리한다.
- API 호출은 `.api.ts`, Query/Mutation 조합은 `hooks`에 두고 화면 컴포넌트에서 직접 `fetch`하지 않는다.
- mutation 성공 후 관련 query를 정확히 invalidate하거나 캐시를 갱신한다.
- optimistic update는 실패 시 rollback 전략이 있을 때만 사용한다.

## 8. 네이밍과 코드 스타일

- 컴포넌트, 타입, interface: `PascalCase`
- 변수, 함수: `camelCase`
- hook: `use` + `PascalCase` (`useMoverList`)
- 이벤트 prop: `onSubmit`, 내부 handler: `handleSubmit`
- boolean: `is`, `has`, `can`, `should` 접두사
- 배열/목록: 의미 있는 복수형 또는 `List` 접미사 (`moverList`)
- 상수: `UPPER_SNAKE_CASE`
- route/feature 폴더: `kebab-case`
- 컴포넌트 파일: `PascalCase.tsx`
- hook 파일: `useSomething.ts`
- API/type 파일: `feature-name.api.ts`, `feature-name.types.ts`

기존 코드 스타일에 맞춰 double quote, semicolon, trailing comma를 사용한다. import는 외부 모듈, `@/` 절대 경로, 상대 경로 순으로 정리한다. 긴 상대 경로 대신 `@/*` alias를 사용한다. 설명 없는 주석, 코드를 그대로 읽은 주석, 디버그 로그, 사용하지 않는 코드와 import를 남기지 않는다.

## 9. 스타일과 반응형

- `src/styles/colors.css`, `typography.css`, `reset.css`가 현재 디자인 토큰의 기준이다.
- 임의의 hex 색상과 중복 `font-size`를 컴포넌트마다 추가하지 않는다. 기존 CSS 변수와 typography class를 우선한다.
- Tailwind를 사용할 때도 기존 토큰과 의미가 겹치는 새 팔레트를 만들지 않는다.
- Tailwind v4 `@theme`으로 토큰 체계를 이전하는 작업은 별도 합의된 마이그레이션으로 수행한다. 기존 CSS 변수 체계와 두 벌로 장기간 운영하지 않는다.
- Figma의 실제 breakpoint와 수치를 먼저 확인한다. 확인할 수 없으면 기존 주변 컴포넌트 패턴을 따르고 임의의 디자인 시스템을 만들지 않는다.
- 최소한 모바일, 태블릿, 데스크톱에서 레이아웃이 깨지지 않는지 확인한다.
- PC 기사님 찾기 화면 왼쪽에는 찜한 기사님을 최대 3명까지 표시한다.
- overlay/modal은 GNB보다 위에 표시하되 z-index 숫자를 각 컴포넌트에서 경쟁적으로 키우지 않는다.

## 10. 접근성과 폼

- 클릭 동작은 `div`가 아니라 `button`/`a` 등 의미에 맞는 요소를 사용한다.
- 모든 폼 요소에 연결된 label, 오류 문구, disabled/loading 상태를 제공한다.
- 모달은 제목, focus 이동/복귀, Esc 닫기, backdrop 닫기 정책을 명확히 한다.
- 아이콘만 있는 버튼에는 `aria-label`을 제공한다.
- 키보드만으로 검색, 필터, Dropdown, 달력, 찜, 모달을 사용할 수 있어야 한다.
- 색상만으로 선택/오류/지정 요청 상태를 전달하지 않는다.

인증 폼의 기본 검증은 다음과 같다.

- 이메일: 일반적인 이메일 형식
- 전화번호: 대한민국 전화번호 형식. 화면 표시와 서버 전송 형식을 분리해 일관되게 정규화한다.
- 비밀번호: 8자 이상이며 영문, 숫자, 특수문자를 각각 1개 이상 포함

검증 실패 메시지는 한국어로 구체적으로 표시한다. 클라이언트 검증은 UX를 위한 것이며 서버 오류도 별도로 처리한다.

## 11. API와 데이터 처리

### 공통 규칙

- 모든 REST 호출은 `src/common/api/client.ts`의 `apiClient`를 사용한다.
- `NEXT_PUBLIC_API_URL`을 기준으로 하고 인증 cookie를 위해 `credentials: "include"`를 유지한다.
- 성공 응답은 `{ success: true, data }`, 실패 응답은 `{ success: false, error: { code, message } }` 형태를 전제로 하되 Swagger와 실제 응답을 최종 확인한다.
- HTTP 오류는 `ApiError`로 처리하고 사용자에게 서버 원문/stack을 노출하지 않는다.
- query parameter는 문자열 조합 대신 `apiClient`의 `query` 옵션을 사용한다.
- `FormData` 요청에는 `Content-Type`을 직접 지정하지 않는다.
- 토큰, cookie, 개인 주소/전화번호를 로그에 출력하지 않는다.
- `.env*`는 커밋하지 않는다.

### 현재 API 후보 목록

Notion의 모든 API가 아직 `To Do` 상태이고 일부 경로에 오탈자나 모호함이 있다. 아래 목록은 feature 분리 기준으로 사용하되, 구현 전 반드시 최신 Swagger/백엔드와 method, path, request, response를 확인한다.

| 도메인           | 후보 API                                                                         |
| ---------------- | -------------------------------------------------------------------------------- |
| Auth             | signup customer/mover, login, refresh, logout, `/auth/oauth/:provider`, callback |
| Mover search     | `GET /movers`, `GET /movers/:id`, `GET /reviews/:moverId`                        |
| Move request     | `POST /move-request`                                                             |
| Customer quote   | `GET /customer-quote`, detail, confirm, history, history detail                  |
| Mover requests   | `GET /movers/me/received-requests`, detail, quote 생성, rejection 생성           |
| Mover quote      | `GET /movers/me/quotes`, `?status=CONFIRMED`, detail, rejected requests          |
| Customer profile | `POST/GET/PATCH /customers/me/profile`, `GET/PATCH /customers/me`                |
| Mover profile    | `POST/GET/PATCH /movers/me/profile`, `GET/PATCH /movers/me`                      |
| Favorites        | `GET /favorites`, favorite 등록/해제 계약 확인 필요                              |
| Reviews          | writable/written 목록 query 계약 확인, `POST /reviews`, `GET /movers/me/reviews` |
| Notification     | 문서화된 endpoint가 없으므로 임의로 만들지 말고 확인                             |

특히 문서의 `auth/signup/userss`, 로그인으로 표기된 `POST auth/me`, `DELETE /favorites`의 대상 식별 방식, `reviews?type=writable, me`는 확정 계약으로 사용하지 않는다.

ERD의 주요 도메인은 `User`, `Customer`, `Mover`, `MoverDetail`, `ServiceType`, `Region`, `CustomerServiceType`, `MoverServiceType`, `MoverRegion`, `MoveRequest`, `DesignatedRequest`, `Quote`, `Review`, `Favorite`, `Notification`이다. 프론트 타입은 DB 테이블을 그대로 복제하지 말고 API DTO에 맞춰 정의한다.

## 12. 핵심 비즈니스 규칙

### 인증/프로필

- customer와 mover의 로그인·회원가입 화면과 권한을 분리한다.
- 이메일과 Google/Naver/Kakao OAuth를 지원한다.
- 로그인 상태를 종료할 수 있는 로그아웃 동작을 모든 인증 화면 흐름과 일관되게 제공한다.
- 프로필 등록 전에는 각 역할의 전용 기능에 접근할 수 없다.
- 인증 여부와 별개로 role과 profile 등록 여부를 확인한다.
- 프로필 이미지, 별명, 경력, 한 줄 소개, 상세 설명, 서비스 종류, 서비스 가능 지역 중 역할별 실제 필드는 Figma와 API DTO를 확인한다. customer와 mover가 같은 필드를 가진다고 추측하지 않는다.
- customer는 GNB 아바타에서 프로필 수정으로, mover는 GNB 아바타에서 마이페이지를 거쳐 프로필 수정으로 이동한다.
- 비회원이 찜 또는 지정 요청을 누르면 로그인 화면으로 이동한다. 원래 목적지 복귀가 가능하도록 redirect 정보를 보존한다.

### 견적 요청

- 한 customer는 동시에 하나의 활성 견적 요청만 가질 수 있다.
- 활성 요청은 확정 전 대기 요청과, 확정 후 이사일 이전 요청을 모두 포함한다.
- 이사일이 지난 뒤에만 새 요청을 만들 수 있다.
- 일반 견적은 최대 5명, 지정 견적은 최대 3명에게 받을 수 있고 총 최대 8개다.
- 지정 요청은 일반 견적 요청을 먼저 만든 뒤 가능하며 UI에서 명확한 라벨로 강조한다.
- 이사 종류, 날짜, 출발지, 도착지 입력 단계를 progress bar로 표시한다.
- 이전 답변을 수정해도 이후 단계와 서버 payload의 일관성이 깨지지 않게 한다.
- 주소는 카카오 우편번호 서비스를 감싼 공통 모달/adapter를 통해 입력한다.

### 기사님 찾기

- 비회원과 customer 모두 목록/상세/리뷰/평점을 볼 수 있다.
- 별명 검색, 리뷰·평점·경력·확정 횟수 정렬, 지역·서비스 필터, 필터 초기화를 지원한다.
- 기사님 목록은 무한 스크롤이다. query key에 검색·정렬·필터를 모두 포함하고 조건 변경 시 첫 페이지부터 다시 조회한다.
- 중복 항목, 중복 요청, 마지막 페이지 이후 요청, 빠른 조건 변경의 race condition을 방지한다.
- 공유 문구 형식은 `이사를 준비하시나요? OOO 기사님을 추천합니다. 무빙에서 확인해 보세요! <기사님 상세 페이지 URL>`을 기준으로 한다.

### 견적/리뷰/알림

- 받은 견적에서 지정 요청을 라벨로 구분하고 기사님 찜·상세·확정 기능을 제공한다.
- 완료 이력에서는 이사 정보, 전체 견적, 확정 견적을 필터로 구분해 조회한다.
- mover는 서비스 가능 지역의 요청만 보고, 지정 요청을 분리/강조하며 견적 전송 또는 반려할 수 있다.
- mover 요청 목록은 이사 유형, 서비스 가능 지역, 지정 요청 여부로 필터링하고 이사일이 빠른 순/최근 요청 순으로 정렬한다.
- 반려한 요청은 별도 목록에서 조회할 수 있게 유지한다.
- 리뷰는 이사 완료 후 확정된 기사님에 대해서만 작성 가능하다.
- 기사님 찾기 목록은 무한 스크롤이지만 리뷰 목록은 요구사항대로 pagination을 사용한다. “모든 목록을 무한 스크롤”로 일반화하지 않는다.
- customer 리뷰 화면은 작성 가능한 목록과 작성 완료 목록을 구분하고, mover 마이페이지는 받은 리뷰와 평점을 함께 보여준다.
- customer는 찜한 기사님 전체 목록을 별도 페이지에서 조회할 수 있다.
- customer 알림: 새 견적, 견적 확정, 이사 당일.
- mover 알림: 새 요청, 견적 확정, 이사 당일.

UI에서 비즈니스 제한을 안내하되 프론트만으로 권한과 수량 제한이 보장된다고 가정하지 않는다. 서버의 401/403/409와 도메인 오류를 처리한다.

## 13. Git, 브랜치, PR 규칙

### 브랜치

- 기준 브랜치: `dev`
- 배포 브랜치: `main`
- 기능 브랜치: `feat/<lowercase-kebab-case>`
- 흐름: `feat/* -> dev -> main`

새 작업은 최신 `dev`에서 분기한다. 작업 브랜치에 최신 `dev`를 반영할 때는 merge commit을 늘리기보다 rebase를 사용한다. 단, AI는 사용자의 미커밋 변경을 임의로 stash/reset하지 않는다.

### 커밋과 PR

커밋과 PR 제목은 다음 형식을 사용한다.

```
feat: 로그인 페이지 구현
fix: 기사님 목록 정렬 오류 수정
refactor: 견적 query hook 분리
docs: API 사용 규칙 보완
chore: 개발 설정 정리
```

- 하나의 커밋은 하나의 논리적 변경을 담는다.
- PR 대상은 `dev`다.
- PR 본문에 연관 이슈, 작업 내용, 검증 방법, UI 변경 스크린샷, 필요한 리뷰 포인트를 작성한다.
- 2명 이상의 리뷰와 Approve를 받은 뒤 GitHub의 **Squash and merge**로 병합한다.
- Approve 없이 작성자가 임의로 merge하지 않는다.
- 충돌이 생기면 팀에 알리고 자신의 feature 브랜치에서 해결한다.

### 금지/주의 명령

- `git push --force`와 `git reset --hard`는 금지한다.
- `main`, `dev`, 다른 사람의 브랜치에 force push하지 않는다.
- 이미 PR에 올린 자신의 feature 브랜치를 rebase한 경우에만, 원격의 다른 커밋이 없는지 확인하고 팀 동의를 얻은 뒤 `-force-with-lease`를 사용할 수 있다.
- 사용자 변경 삭제, 브랜치 삭제, 대량 파일 이동은 명시적 요청 없이 수행하지 않는다.

## 14. 검증과 완료 기준

최소 검증 명령은 다음과 같다.

```bash
npm run lint
npx tsc --noEmit
```

배포에 영향을 주는 변경은 필요한 환경변수가 준비된 상태에서 다음도 실행한다.

```bash
npm run build
```

현재 자동 테스트 스크립트와 테스트 프레임워크는 설정되어 있지 않다. 빈 `test.tsx` 파일을 테스트로 간주하거나 실행했다고 보고하지 않는다. 테스트 도입은 별도 합의 후 package script와 실제 테스트 파일을 함께 추가한다.

UI 변경 시 관련 역할과 viewport에서 다음을 직접 확인한다.

- 정상/로딩/빈 목록/오류 상태
- 로그인 전/후, role 불일치, profile 미등록
- 키보드 조작과 focus
- 긴 한국어 문구와 작은 화면
- 검색·정렬·필터 초기화
- 무한 스크롤 또는 pagination의 마지막 페이지
- mutation 중 중복 제출 방지와 실패 복구

검증 명령이 기존 저장소 문제나 환경변수 부족으로 실패하면 실패를 숨기거나 성공으로 표현하지 않는다. 실행한 명령, 결과, 이번 변경과의 관련성을 구분해 보고한다.

## 15. AI 작업 결과 보고 형식

작업을 마칠 때 다음 내용을 짧고 구체적으로 보고한다.

1. 무엇을 변경했는지
2. 변경한 주요 파일
3. 실행한 검증과 결과
4. 확인하지 못한 사항, API/Figma 의존성, 남은 위험

요청하지 않은 commit, push, PR 생성, merge, 배포는 하지 않는다. 작업하지 않은 기능을 구현했다고 말하지 않으며, 임시 데이터·TODO·mock을 남겼다면 위치와 이유를 명시한다.
