# Troubleshooting History

- **[2025-06-21] No troubleshooting events yet for datetime editing in ExpensesConfirmationStack.**

---

## 2025년 6월 30일 - GitHub OAuth CORS 문제

**문제 상황:**
- GitHub OAuth 인증 시 CORS 에러 발생
- 클라이언트에서 직접 GitHub API를 호출할 때 브라우저에서 차단

**원인 분석:**
- GitHub.com이 브라우저의 CORS 정책으로 인해 직접적인 클라이언트 요청을 차단
- OAuth 플로우는 서버 사이드에서 처리되어야 함

**해결 방법:**
- 팝업 창을 이용한 OAuth 인증 방식 구현
- 백엔드를 통해 OAuth URL 생성 후 팝업으로 인증 진행
- postMessage API를 사용하여 팝업과 부모 창 간 통신 구현
- 팝업 차단 시 기존 리다이렉트 방식으로 fallback 처리

**재발 방지:**
- OAuth 인증은 항상 백엔드를 통해 처리
- 클라이언트에서는 팝업 또는 리다이렉트 방식만 사용
- 보안을 위해 postMessage에서 origin 검증 추가
