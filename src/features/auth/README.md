# 프론트 Auth 연동

인증 상태의 소유자는 루트 `src/providers/AuthProvider.tsx`입니다. 사용자 정보는 TanStack Query의 `["auth", "session"]`에 한 번만 저장합니다. `useAuth`는 Context 소비용이며 조회·갱신·로그아웃을 별도로 구성하지 않습니다.

Provider 순서는 `QueryProvider → AuthProvider → ModalProvider → 모든 라우트 그룹`입니다. 모달에서도 같은 인증 상태와 명령을 사용할 수 있습니다. 공개 라우트에는 AuthGuard가 없으며, 기사 목록에서 인증 상태를 읽는 것은 찜 버튼과 사이드바 표시를 위한 것입니다. 기사 목록·상세의 기존 mock API는 Auth API와 별개이며 이번 범위에서 변경하지 않았습니다.

## API 계약

- `POST /auth/signup`, `POST /auth/login`: 실제 DTO를 전송하고 `GET /auth/me`로 쿠키 세션을 확인합니다.
- `GET /auth/me`: 최신 공개 사용자 DTO를 조회합니다. email은 non-null이며 profileCompleted는 서버 값입니다.
- `POST /auth/refresh`: 공통 API client만 호출합니다.
- `POST /auth/logout`: 두 서버 인증 쿠키를 삭제하고 Query와 완료된 개인 mutation 캐시를 정리합니다.
- `GET /auth/oauth/:provider?role=...&format=json`: 공급자 인증 URL과 state 쿠키를 받아 이동합니다.
- 공급자 callback은 백엔드가 처리하고 프론트 `/auth/callback`에서 최신 `/auth/me`를 확인합니다.

Access/Refresh JWT는 HttpOnly 쿠키로만 전달합니다. 토큰을 응답 Body·localStorage·sessionStorage에서 관리하지 않습니다.

## 인증·인가

Provider가 `user`, `status`, `credentials`, `logout`, `refetchUser`, `checkAccess`를 제공합니다.

- status: loading / guest / authenticated / auth-error / network-error / error
- checkAccess: 로딩·오류·비회원·역할 불일치·프로필 필요·접근 가능을 구분
- 라우트 가드: customer/mover 그룹에서 화면 이동만 안내
- 실제 권한: 백엔드 Auth guard와 Service가 최종 검사

`refetchUser()`는 최신 사용자 또는 null을 반환하며 조회 실패 시 오류를 던집니다. 프로필 API 담당자는 저장 성공 후 이 함수를 호출하거나 Auth Query를 무효화해야 합니다. 고객·기사님 등록 폼은 현재 UI의 onSubmit API 주입이 없어 실제 저장을 수행하지 않습니다. 이번 작업에서 프로필 폼 디자인과 mover profile/mypage API는 변경하지 않았습니다.

## 이동 흐름

- 미등록 CUSTOMER → `/customer-profile/register`
- 미등록 MOVER → `/mover-profile/register`
- 등록 완료 CUSTOMER 기본 진입 → `/mover-search`
- 등록 완료 MOVER 기본 진입 → `/mover-mypage`
- 등록 완료 사용자가 등록 페이지를 다시 열면 정상 진입 페이지로 이동
- 프로필 수정은 `/customer-profile/edit`, `/mover-profile/edit`의 기존 경로 유지
- 로그인 후 redirect는 공개 경로 또는 자기 역할의 경로만 허용
- 로그아웃 → 홈. 기존 역할 가드의 로그인 이동이 이 이동을 덮지 않도록 처리

고객 기본 진입은 기존 공개 기사님 찾기 경로를 사용합니다. 팀에서 견적 요청을 첫 진입으로 확정하면 resolveAuthenticatedPath의 기본 경로만 변경하면 됩니다.

## Refresh와 비동기 처리

`ACCESS_TOKEN_EXPIRED`와 `ACCESS_TOKEN_MISSING`만 갱신합니다. Access 쿠키는 만료 시 브라우저에서 자동 삭제되므로 MISSING도 포함합니다. INVALID_CREDENTIALS, Access 위변조, 삭제된 사용자 및 기타 401은 무조건 갱신하지 않습니다.

동시 요청과 갱신 중 시작한 요청, 늦은 401은 갱신 Promise를 공유합니다. 성공 후 원래 요청을 최대 한 번만 재시도하며 Refresh 자체는 재귀 갱신하지 않습니다. 실패 시 Provider에 알리고 사용자·개인 캐시를 정리합니다. 원 요청의 취소는 공유 Refresh를 취소하지 않습니다.

로그인·로그아웃·Refresh 쿠키 변경은 탭 안에서 직렬화하며 Web Locks 지원 브라우저에서는 같은 origin의 탭 간에도 직렬화합니다. generation 검사와 Query signal 취소로 이전 /me·개인 API 결과가 새 계정이나 로그아웃 상태를 복구하지 못하게 합니다. 모든 탭의 Query 상태를 실시간 동기화하는 기능은 별도로 구현하지 않았습니다.

Refresh는 백엔드의 stateless 재발급 정책을 유지합니다. 이전 토큰의 서버 폐기·재사용 탐지·DB 세션을 프론트에서 추가하지 않습니다. 서버에서 호출하는 apiClient는 브라우저 쿠키 자동 전달·재발급을 수행하지 않습니다.

## 로컬 환경

환경변수 이름은 기존 `NEXT_PUBLIC_API_URL`을 유지하고 프록시/rewrite를 추가하지 않았습니다. API 주소는 백엔드 origin을 직접 가리켜야 합니다. 브라우저 Refresh 요청 경로는 쿠키 Path와 같은 `/auth/refresh`여야 하므로 임의의 `/api` prefix는 호환되지 않습니다.

로컬에서는 FE localhost:3000, BE localhost:4000의 same-site 요청을 사용합니다. CORS credentials 허용과 SameSite 쿠키 정책은 별개입니다. 백엔드는 Sec-Fetch-Site: cross-site 상태 변경 요청을 차단하므로 CORS allowlist에 추가하는 것만으로 서로 다른 사이트 배포가 지원되지는 않습니다. 배포 도메인과 gateway 경로는 팀과 확정해야 합니다.

OAuth Client ID/Secret과 공급자 callback URL은 백엔드·공급자 개발자 콘솔에만 설정합니다. 성공 로그인을 공급자별 실제 계정으로 검증하는 작업은 남아 있습니다.

## 검증

`npm run test:auth`는 기존 tsx와 Node test runner를 사용하며 개인 .env나 실제 서버 없이 실행합니다. 테스트 패키지를 추가하지 않았습니다.

자세한 변경 목록·실행 결과·실제 연동/미검증 구분은 `docs/auth-integration.md`를 참고하세요.
