# Task History

- **[2025-06-21] Add datetime editing to ExpensesConfirmationStack**
  - Added plan to allow editing of the `dt` (datetime) field for each expense using Shadcn UI components.
  - Will update UI, state management, and add tests for the new feature.

---

## 2025년 6월 30일 - GitHub OAuth 팝업 방식 구현

**목적:**
- GitHub OAuth 인증 시 별도의 팝업 창을 사용하여 사용자 경험 개선
- 메인 페이지를 벗어나지 않고 인증 처리 가능

**구현 내용:**
- [x] 팝업 기반 OAuth 유틸리티 함수 구현
- [x] GitHub OAuth 팝업 처리 로직 추가
- [x] 콜백 페이지에서 부모 창으로 메시지 전송 구현
- [x] 에러 처리 및 팝업 차단 fallback 구현
- [x] login-form.tsx에서 팝업 OAuth 사용하도록 업데이트

**변경된 파일:**
- `src/lib/api/auth.ts` - 팝업 OAuth 함수들 추가 (openOAuthPopup, oauthLoginPopup)
- `src/app/oauth/callback/page.tsx` - 팝업 콜백 처리 페이지 생성
- `src/components/auth/login-form.tsx` - 팝업 OAuth 사용하도록 수정

**테스트:**
- [ ] GitHub OAuth 팝업 인증 테스트
- [ ] Google OAuth 팝업 인증 테스트
- [ ] 팝업 차단 시 fallback 동작 테스트
- [ ] 에러 상황별 처리 테스트

**리뷰 포인트:**
- 팝업과 부모 창 간의 postMessage 보안
- CORS 이슈 해결 여부
- 사용자 경험 개선 효과

**후속 작업:**
- 실제 백엔드와 연동 테스트
- 프로덕션 환경에서의 도메인 설정 확인
- 접근성 개선 (키보드 네비게이션 등)

---

## 2025년 6월 30일 - OAuth 콜백 리다이렉트 방식으로 수정

**목적:**
- 팝업 방식 대신 리다이렉트 방식으로 OAuth 콜백 처리
- Next.js 정적 생성과 호환되는 구조로 변경

**구현 내용:**
- [x] 동적 라우트를 정적 라우트로 변경 (`/oauth/[provider]/callback` → `/oauth-callback`)
- [x] 팝업 관련 코드 제거하고 리다이렉트 방식으로 변경
- [x] 인증 성공 시 메인 페이지로, 실패 시 로그인 페이지로 자동 이동
- [x] 사용자 상태 가져오기 및 에러 처리 개선
- [x] 진행률 표시 및 수동 이동 버튼 추가

**변경된 파일:**
- `src/app/oauth-callback/page.tsx` - 리다이렉트 방식 콜백 처리로 수정
- `next.config.mjs` - trailing slash 설정 추가
- 동적 라우트 디렉토리 제거

**테스트:**
- [ ] GitHub OAuth 리다이렉트 인증 테스트
- [ ] Google OAuth 리다이렉트 인증 테스트
- [ ] 에러 상황별 리다이렉트 테스트
- [ ] 사용자 정보 가져오기 테스트

**리뷰 포인트:**
- 정적 생성과의 호환성
- 사용자 경험 (자동 리다이렉트 타이밍)
- 에러 처리 및 복구 메커니즘

**후속 작업:**
- 백엔드 콜백 URL 설정 변경 필요
- 프로덕션 환경 테스트
