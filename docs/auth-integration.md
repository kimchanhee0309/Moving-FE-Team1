# Auth 백엔드 연동 작업 보고

## 작업 범위와 보존

- 작업 저장소: 기존 `Moving-FE-Team1`. 별도 프론트 작업 폴더는 사용하지 않습니다.
- 작업 브랜치: `feat/auth-api-integration`, 시작 기준 HEAD `0f6bd0f`.
- 프론트·백엔드 루트 AGENTS.md와 하위 규칙 유무, 기존 변경, Auth 사용처 및 공통 컴포넌트를 확인했습니다.
- commit, push, PR 생성, merge, rebase, 새 패키지 설치를 실행하지 않았습니다.
- 백엔드 Auth 정책·Prisma Schema·환경변수·프록시 설정을 변경하지 않았습니다.
- 작업 전부터 미커밋이던 `src/features/customer-profile/components/CustomerProfileEditForm.tsx`는 그대로 보존했습니다. 백업과 SHA-256이 동일하며 이번 Auth 변경에 포함해서 처리하지 않았습니다.

## 기존 문제와 원인

1. 루트 Providers의 AuthProvider가 주석 처리되어 있었고, `useAuth`를 호출하는 각 위치가 세션 Query와 logout mutation을 구성했습니다. Query key는 공유했지만 전역 인증 명령과 오류·인가 판단을 소유하는 Provider가 없었습니다.
2. Refresh가 Auth API의 세션 조회 안에만 있었습니다. 다른 도메인의 API 요청은 갱신·재시도를 공유하지 못했고, 세션 조회는 모든 401을 갱신 대상으로 처리했습니다.
3. 로그인·로그아웃에서 QueryClient 전체를 clear하고 세션을 다시 넣었습니다. Query 취소와 별개로 쿠키 갱신·계정 변경 도중의 늦은 응답을 차단하는 기준이 없었습니다.
4. 서버 요청·응답을 타입만으로 신뢰했고, 백엔드 필드 검증·오류 details·네트워크 오류를 충분히 구분하지 못했습니다. 가입/로그인 응답만으로는 브라우저에 쿠키가 실제 설정됐는지 확인할 수 없었습니다.
5. callback에서 최신 세션 확인, 오류 코드 제한, 안전한 역할별 redirect와 등록 완료 사용자의 등록 페이지 재진입 처리가 보강되어야 했습니다.

기존 화면을 전체 삭제하지 않고 Auth 폼·컨트롤러·가드·callback·API의 책임을 재구성했습니다.

## 생성·수정·삭제 파일

| 파일 | 변경 및 이유 |
| --- | --- |
| `src/providers/AuthProvider.tsx` | 생성. 인증 Query, 이메일 mutation, logout, 캐시 정리, 상태 구분 및 화면 인가 판단의 단일 소유자입니다. |
| `src/providers/Providers.tsx` | 기존 index.tsx의 루트 조합을 이동하고 QueryProvider → AuthProvider → ModalProvider 순서로 연결했습니다. |
| `src/providers/QueryProvider.tsx` | 기존 QueryProvider 구현을 PascalCase 파일로 이동했습니다. 전역 Query 기본 설정은 유지했습니다. |
| `src/providers/ModalProvider.tsx` | 기존 모달 구현을 PascalCase 파일로 이동했습니다. 모달 동작·디자인·공개 인터페이스는 유지했습니다. |
| `src/providers/index.ts` | 생성. 기존 `@/providers` import 경로를 유지하는 배럴입니다. |
| `src/providers/modal-provider.tsx` | 기존 경로에서 ModalProvider/useModal을 재수출하는 호환 파일로 변경했습니다. 다른 담당자의 import 변경이 필요하지 않습니다. |
| `src/providers/index.tsx`, `src/providers/query-provider.tsx` | 이동 후 중복 구현을 삭제했습니다. query-provider 직접 사용처가 없음을 확인했습니다. |
| `src/common/auth/AuthContext.tsx` | 생성. 공통 Context와 소비 전용 useAuth를 제공합니다. common에서 feature를 import하지 않습니다. |
| `src/common/auth/access.ts` | 생성. 비회원·오류·역할·프로필 상태에 따른 접근 판정을 순수 함수로 분리했습니다. |
| `src/common/auth/types.ts` | 수정. 실제 공개 사용자 DTO와 전역 인증 상태·명령의 공통 계약을 정의했습니다. |
| `src/common/api/auth-session.ts` | 생성. 쿠키 변경 직렬화, 세션 변경 시 이전 요청 무효화, 인증 실패 통지를 담당합니다. 사용자 상태를 따로 보관하지 않습니다. |
| `src/common/api/client.ts` | 수정. credentials, 필드 오류, 제한된 Refresh 조건, 공유 갱신, 1회 재시도, 취소·계정 변경 경합을 처리합니다. 기존 apiClient 호출 인터페이스는 유지했습니다. |
| `src/common/api/error.ts`, `src/common/api/types.ts` | 수정. 기존 ApiError 생성자에 선택적 details를 추가해 하위 호환성을 유지했습니다. |
| `src/features/auth/auth.keys.ts` | 생성. Auth Query key factory와 기존 AUTH_QUERY_KEY를 제공합니다. |
| `src/features/auth/auth.api.ts` | 수정. 실제 DTO 정규화·응답 검증·쿠키 세션 확인·OAuth 시작 URL 검증을 구현했습니다. 세션 조회 내부의 별도 Refresh 구현은 제거했습니다. |
| `src/features/auth/auth.types.ts` | 수정. 사용자 DTO는 공통 타입을 재사용합니다. 폼 타입은 유지했습니다. |
| `src/features/auth/auth.utils.ts` | 수정. 백엔드 검증 조건, 안전한 redirect, 역할별 등록/정상 진입 경로를 반영했습니다. |
| `src/features/auth/hooks/useAuth.ts` | 수정. Context 소비 함수와 기존 Query key만 재수출합니다. 기존 useAuthSubmit은 사용처를 Provider.credentials로 전환하고 제거했습니다. |
| `src/features/auth/components/AuthController.tsx` | 수정. 이메일 인증은 Provider mutation을 사용하고, OAuth 시작은 폼의 pending 상태로 처리합니다. |
| `src/features/auth/components/AuthForm.tsx` | 수정. 기존 UI를 유지하면서 필드 오류·서버 오류·isPending·중복 제출 방지·입력 disabled를 연결했습니다. |
| `src/features/auth/components/AuthGuard.tsx` | 수정. Provider의 판정으로 이동 안내만 담당합니다. Refresh는 구현하지 않습니다. |
| `src/features/auth/components/AuthCallback.tsx` | 수정. 최신 /auth/me 검증, 제한된 OAuth 오류 안내, 재시도 및 안전한 이동을 처리합니다. |
| `src/features/auth/test.tsx`, `src/features/auth/components/test.tsx` | 삭제. 내용이 없고 import 사용처가 없는 파일이어서 실행 가능한 테스트로 교체했습니다. 화면 영향은 없습니다. |
| `tests/auth/*.test.ts`, `package.json` | test:auth script를 추가하고 서버 세션·리뷰 회귀 검사 포함 테스트 34개를 구성했습니다. 기존 tsx와 Node test runner를 사용하고 의존성·lockfile은 변경하지 않았습니다. |
| `src/features/auth/README.md`, `src/providers/README.md`, `docs/auth-integration.md` | 구조·공개 계약·연동 결과·남은 확인사항을 문서화했습니다. |

이동·삭제 이유와 공통 API/Provider의 영향은 변경 전에 보고했습니다. 작업 과정의 별도 인증 세션 hook도 남기지 않았습니다.

## 재사용 및 다른 담당 영역 영향

- 기존 Auth 페이지와 폼 레이아웃, Input, Button, SNS 버튼, 디자인 토큰을 재사용했습니다.
- 루트 레이아웃의 기존 Providers import, customer/mover 레이아웃의 AuthGuard 연결, GNB의 기존 Props·이벤트 연결을 재사용했습니다.
- GNB 내부·디자인, 공통 Input/Button, 프로필 폼, 다른 담당 페이지 디자인을 변경하지 않았습니다.
- 공개 라우트에는 AuthGuard가 없습니다. 공개 기사님 찾기에서 useAuth는 찜 행동과 사이드바를 위한 Context 소비이며, 페이지 접근을 제한하지 않습니다.
- 모달은 AuthProvider 아래에 있어 동일한 인증 상태와 명령을 소비할 수 있습니다.
- 공통 API를 사용하는 브라우저 요청도 이제 Access 만료/삭제 시 같은 Refresh를 공유합니다. 잘못된 비밀번호 등 모든 401에 갱신하지 않습니다.
- 계정 변경·logout·Refresh 실패 시 Auth 이외 Query 중 `meta.public !== true`인 캐시를 제거합니다. 현재 개인/공개 캐시 구분 규칙이 없어 보수적으로 처리했습니다. 공개 캐시를 유지하려는 담당자는 민감한 데이터가 없음을 확인하고 `meta: { public: true }`를 지정해야 합니다. 완료된 mutation 캐시는 제거하고 진행 중 mutation은 보존합니다.
- useAuth 경로와 기본 user/isPending/error/logout/refetch 인터페이스는 유지했습니다. refetch 결과 data의 내부 구조는 AuthSession입니다. 기존 코드의 직접 refetch 결과 소비 사용처를 확인하고 callback을 함께 변경했습니다.
- 사용자 사본을 Context state나 저장소에 추가하지 않았습니다. Query의 `["auth", "session"]`이 유일한 현재 사용자 상태입니다.

## 구현한 인증 흐름

1. 루트 Provider가 /auth/me로 로딩·비회원·인증 오류·네트워크 오류·일반 오류·로그인을 구분합니다.
2. 가입/로그인은 역할별 실제 DTO를 전송하고 서버 응답 후 /auth/me를 다시 확인합니다. 쿠키가 설정되지 않은 성공 응답을 로그인 완료로 처리하지 않습니다. 가입 후 세션 확인 실패는 계정 생성과 로그인 상태를 구분해서 안내합니다.
3. 가입 또는 로그인 후 profileCompleted=false이면 역할별 register로 이동합니다. 완료 CUSTOMER 기본 경로는 /mover-search, 완료 MOVER는 /mover-mypage입니다. 자기 역할/공개 경로의 안전한 redirect는 반영합니다.
4. 비회원 보호 페이지 접근은 query를 포함한 목적지를 보존해서 역할별 로그인으로 이동합니다. 다른 역할은 접근 제한을 표시합니다. 프로필 미등록자는 역할 기능보다 register가 우선입니다. 등록 완료 사용자의 register 재진입은 정상 페이지로 이동합니다.
5. Access TOKEN_MISSING/EXPIRED만 공통 client에서 갱신합니다. 동시 요청·갱신 중 요청·늦은 401은 Promise를 공유하고 각 원 요청은 최대 1번 재시도합니다. Refresh 자체는 재귀 갱신하지 않습니다.
6. Refresh 실패는 개인 캐시를 정리하며, Refresh 쿠키 없음은 비회원, 위변조·유효하지 않은 인증은 인증 오류로 사용자도 비웁니다. 연결 실패는 마지막 사용자 표시를 유지하고 network-error로 접근을 제한합니다.
7. logout은 서버 쿠키 삭제 성공 후 상태/캐시를 정리하고 홈으로 이동합니다. Query 취소와 세션 변경 기준으로 이전 /me 응답을 차단하고 역할 guard가 홈 이동을 덮지 않게 처리했습니다.
8. Google/Kakao/Naver 시작 API에서 검증된 공급자 URL로 이동합니다. callback은 query의 성공 표시를 신뢰하지 않고 최신 /me와 역할·profileCompleted를 확인합니다. backend가 허용한 OAuth 오류만 안내하고 알 수 없는 코드는 일반 오류로 표시합니다.

토큰을 Body/localStorage/sessionStorage에 저장하지 않습니다. HttpOnly 쿠키, stateless Refresh 재발급, 서버 쿠키 삭제 방식의 logout 정책을 유지했습니다. 화면 가드는 UX용이며 최종 인증·인가는 백엔드가 담당합니다.

## 실행한 검사

| 검사 | 결과 |
| --- | --- |
| `npm run lint` | 통과 |
| `npx tsc --noEmit` | 통과 |
| `npm run build` | 통과, 32개 페이지 생성 |
| `npm run test:auth` | 서버 세션·PR 리뷰 수정 후 34개 통과 |
| 백엔드 `npm test -- --runInBand tests/auth` | 기존 Auth 14 suites / 49 tests 통과 |
| `git diff --check` | 통과 |
| 범위 확인 | 백엔드 변경 없음, GNB/Input/Button/next.config.ts/package-lock.json/AGENTS.md 변경 없음, 기존 프로필 변경 해시 동일 |

빌드가 저장소 밖 사용자 홈의 package-lock을 발견하는 기존 경고는 있지만 빌드는 성공했습니다. 이 경고를 해결하려고 전역 설정을 변경하지 않았습니다.

자동 테스트는 갱신 공유·실패·1회 재시도·갱신 대상 제외·원 요청 취소·logout 경합·필드 오류·DTO·네트워크 오류·3개 공급자 시작 URL·안전한 redirect·역할/프로필 접근 분기를 포함합니다. Provider/화면 동작은 아래 실제 브라우저 확인을 병행했습니다.

## 실제 서버·브라우저로 확인한 항목

- 로컬 FE 3000 / BE 4000 및 개발용 로컬 DB를 사용했습니다. 기존 개인 계정 대신 합성 테스트 계정 3개를 만들었고 계정/프로필 레코드는 개발 DB에 남아 있습니다. 자동으로 삭제하지 않았습니다.
- CUSTOMER/MOVER 이메일 가입·로그인, 잘못된 비밀번호 오류, 중복 제출 중 disabled, 새로고침 세션 유지, logout 후 홈 이동.
- 비회원 보호 페이지 로그인 이동과 query 보존, 다른 역할 접근 제한, 두 역할 미등록 register 이동.
- CUSTOMER 기존 프로필 API로 테스트 프로필을 저장한 후 profileCompleted=true 확인, 로그인 기본 진입, register 재진입 이동, callback의 안전한 목적지 이동.
- 세 공급자 시작 API의 공급자 URL/state 발급, state 없는 callback의 제한된 오류 표시, 유효 state의 공급자 취소 callback. 실제 OAuth 공급자의 code 교환은 수행하지 않았습니다.
- 이미 로그인된 이메일 세션으로 프론트 callback의 최신 /me·역할·프로필 판정 및 이동 확인. 이것은 공급자 로그인 성공 검증과 구분합니다.
- 로컬 테스트에서 만료된 Access JWT를 사용해 실제 /me 3개 동시 요청 → 실제 Refresh 1회 → 각 요청 1회 재시도 성공. 백엔드 만료 설정·정책은 변경하지 않았습니다.
- 실제 잘못된 Refresh 쿠키의 갱신 실패, 실제 logout 쿠키 삭제 및 이후 비회원 세션.
- BE 중단 시 보호 페이지의 네트워크 오류/재시도 표시, 공개 기사님 찾기 접근 가능.
- 허용 Origin이라도 cross-site 상태 변경 요청은 403으로 차단되는 기존 백엔드 정책 확인.
- 375/744/1200px에서 DOM 경계 검사: Auth 폼·입력·버튼의 가로 넘침 없음. 캡처가 일부 잘려 전체 시각 검증은 완료로 보고하지 않습니다.

## 수동 확인·팀 협의가 남은 사항

1. **실제 Google/Kakao/Naver 계정의 성공 OAuth 로그인**: 공급자 동의·code 교환·신규 가입·기존 OAuth 재로그인을 실제 계정으로 검증해야 합니다. 이메일 미제공/미인증·기존 이메일 충돌은 실제 공급자 계정 조건으로 추가 확인이 필요합니다.
2. **프로필 폼 저장 연결**: 고객·기사 등록 폼은 기존 UI의 onSubmit API 주입이 없어 실제 저장을 수행하지 않습니다. Auth의 등록 페이지 이동은 구현했지만 폼 API까지 완료된 onboarding으로 보고하지 않습니다. 담당자는 저장 성공 후 Provider.refetchUser() 또는 Auth Query 무효화로 최신 profileCompleted를 반영해야 합니다. mover profile/mypage API는 이번 제외 범위입니다.
3. **MOVER 등록 완료의 실제 페이지 흐름**: 경로·접근 분기는 자동 검사했으며, 실제 mover 프로필 저장과 완료 계정의 정상 진입은 저장 API 담당 작업 후 확인해야 합니다.
4. **고객 기본 진입 경로**: 기존 공개 /mover-search를 사용했습니다. 팀 플로우가 /move-request를 첫 진입으로 확정하면 resolveAuthenticatedPath의 기본 경로를 맞춰야 합니다.
5. **배포 쿠키·도메인**: 기존 NEXT_PUBLIC_API_URL을 유지했습니다. 직접 백엔드 origin으로 요청하며 /auth/refresh가 Refresh 쿠키 Path와 일치해야 합니다. 임의 /api prefix는 호환되지 않습니다. CORS와 SameSite는 별개이고 백엔드가 cross-site POST를 차단하므로 배포 도메인/gateway를 팀과 확정해야 합니다. localhost/127.0.0.1 혼용도 피해야 합니다.
6. **OAuth 개발자 콘솔**: 공급자 callback은 백엔드 URL, 이후 이동은 프론트 /auth/callback입니다. Client Secret은 프론트에 추가하지 않았고 백엔드·콘솔에서만 관리합니다. 실제 설정값 원문을 출력하거나 변경하지 않았습니다.
7. **공개 Query 분류와 여러 탭**: 공개 캐시 유지 규칙의 meta.public 적용은 팀 협의가 필요합니다. 쿠키 변경은 Web Locks 지원 환경에서 탭 간 직렬화하지만, 모든 탭의 Query 상태를 즉시 동기화하는 기능까지 구현하지는 않았습니다.
8. **기존 mock 및 시각 검증**: 기사님 찾기·상세 등 Auth 이외 도메인의 기존 mock은 유지했습니다. Auth 요청에는 임시 사용자 서버나 우회를 사용하지 않습니다. 전체 화면 시각/키보드 확인은 추가 수동 QA가 필요합니다.
# 서버 컴포넌트에서 인증 조회

인증이 필요한 서버 page/component에서만 `@/common/auth/server`를 import합니다. 이 모듈은 `server-only` 경계가 있어 클라이언트에서 사용할 수 없습니다. 공개 페이지와 루트 레이아웃에 일괄 적용하지 않습니다.

```tsx
import { getServerAuthAccess } from "@/common/auth/server";

// 보호 페이지에서 조회한 뒤 access에 따라 페이지의 이동 안내/오류 UI를 선택합니다.
const { user, status, access } = await getServerAuthAccess("CUSTOMER");
// 프로필 최초 등록 페이지는 getServerAuthAccess("CUSTOMER", true)를 사용합니다.
```

`getServerSession()`은 Next.js `cookies()`로 요청의 `accessToken`을 읽고, 기존 `apiClient`의 Cookie 헤더에 Access만 명시적으로 전달하여 GET `/auth/me`를 호출합니다. JWT를 프론트에서 해석하거나 Secret을 공유하지 않습니다. 응답은 클라이언트와 동일한 공개 DTO mapper로 검증합니다.

- 쿠키 없음: `status: guest`. 요청을 생략합니다.
- 성공: `user`, `isAuthenticated`, `status: authenticated`를 반환합니다.
- 401: `status: auth-error`, `user: null`입니다.
- 통신 장애: `status: network-error`. 서버에는 이전 사용자 캐시가 없습니다.
- 다른 서버/응답 오류: `status: error`. 보호 접근은 `unavailable`입니다.
- `access`: `guest`, `role-mismatch`, `profile-required`, `allowed`, `unavailable`로 기존 접근 규칙을 재사용합니다. 실제 데이터 인가는 백엔드가 담당합니다.

사용자 조회는 `cache: no-store`이며 React `cache`는 같은 서버 렌더의 중복 호출만 공유합니다. 모듈 전역에 사용자나 토큰을 저장하지 않습니다. 클라이언트 AuthProvider는 기존 Query를 계속 관리하며 서버 조회 결과를 별도 전역 상태로 복사하지 않습니다. 로그인/로그아웃 이후 기존 서버 화면을 갱신해야 하는 소비자는 성공 시점에 `router.refresh()`를 호출합니다.

요청 쿠키를 읽는 페이지는 동적 렌더링 대상입니다. 쿠키는 프론트 도메인/경로로 브라우저가 보낸 것만 읽을 수 있으므로, 서로 다른 도메인의 백엔드 전용 쿠키를 사용하는 배포 환경에서는 도메인 또는 게이트웨이 구성을 먼저 협의해야 합니다. 환경변수·쿠키 설정은 이번 작업에서 변경하지 않았습니다.

Refresh 쿠키는 `/auth/refresh` 경로에 한정됩니다. 서버 컴포넌트는 쿠키를 설정할 수 없으므로 여기서 자동 Refresh하지 않습니다. 만료/쿠키 없음만으로 서버에서 즉시 로그인 페이지로 강제 이동하면 기존 클라이언트 갱신 기회를 없앨 수 있습니다. 아래 서버 인증 경계가 Provider의 Query 재조회 → 기존 apiClient의 갱신 → `router.refresh()`로 이 상황을 처리합니다. 다른 담당 페이지에는 일괄 적용하지 않았습니다.

## 팀원용 서버 인증 경계와 갱신

```tsx
import { ServerAuthBoundary } from "@/features/auth/components/ServerAuthBoundary";

export default function Page() {
  return <ServerAuthBoundary role="CUSTOMER" render={async (user) => {
    // 개인 데이터 API 조회와 UI 조합은 이 안에서 수행합니다.
    return <p>{user.name}님</p>;
  }} />;
}
```

- 프로필 최초 등록은 `allowIncompleteProfile`을 전달합니다. 등록 이후 기능에서는 생략합니다.
- 서버가 허용하기 전에는 `render`를 실행하지 않습니다. 보호 데이터 조회를 경계 바깥이나 미리 생성한 children에서 수행하지 않습니다.
- 서버 개인 API도 `apiClient`를 사용하되 `await getServerAuthRequestOptions()` (`@/common/auth/server`)를 options에 전달해야 합니다. `credentials: include`만으로는 서버 요청에 인증 쿠키가 붙지 않습니다. 헤더/토큰은 클라이언트 props로 넘기지 않습니다.
- 서버 실패 시 `ServerSessionRecovery`가 Provider의 `refetch({ cancelRefetch: false })`를 사용합니다. 여러 경계의 Query는 공유되며 만료 갱신 자체는 기존 apiClient의 단일 Refresh/1회 재시도를 재사용합니다. 가드에는 Refresh 구현을 추가하지 않습니다.
- 브라우저 조회에 성공하면 서버 렌더를 다시 요청합니다. 서버에도 쿠키가 전달되어 인증이 허용되어야 보호 콘텐츠가 표시됩니다.
- 자동 복구는 경계 마운트당 한 번입니다. 서버 재조회에도 실패하면 기존 역할별 로그인/프로필 안내 또는 수동 재시도를 표시합니다. 네트워크 오류에 캐시 user가 남아 있어도 복구 성공으로 처리하지 않습니다.
- 로그아웃/계정 변경 중의 응답은 generation 검사로 거절하며 해제된 경계는 화면 갱신을 실행하지 않습니다. 사용자 상태는 계속 AuthProvider의 단일 Query가 관리합니다.
- 로그인·로그아웃·`refetchUser()` 성공 시 AuthProvider가 서버 화면도 갱신합니다. 프로필 저장 소비자는 기존처럼 저장 성공 후 `await refetchUser()`를 호출합니다.
- 기존 클라이언트 페이지와 `(customer)/(mover)` AuthGuard는 그대로 사용합니다. 서버 인증 경계는 서버에서 개인 데이터 조회가 필요한 페이지에만 적용합니다. 같은 페이지의 경계를 반복해서 중첩하지 않습니다.

실제 로컬 점검: 두 서버를 `localhost`로 실행 → 로그인 → 서버 페이지 조회 → Access 쿠키 제거(Refresh 유지) → 경계의 갱신/서버 재조회 확인 → Refresh 제거/네트워크 중단/역할 변경/로그아웃 확인. `localhost`와 `127.0.0.1`을 혼용하지 않습니다. 이 흐름은 단위 테스트와 구분하여 실제 브라우저에서 확인해야 합니다.
