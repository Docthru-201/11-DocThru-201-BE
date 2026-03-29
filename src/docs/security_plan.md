### 기본 보안

- [ ] **HTTPS 적용**  
       → 운영 환경에서 HTTPS 강제, HTTP 요청의 HTTPS 리다이렉트 적용

- [ ] **Helmet 적용**  
       → `helmet()` 미들웨어 등록, 기본 보안 헤더 설정, 필요 시 CSP 옵션 조정

- [x] **CORS 허용 출처 제한**  
       → `cors` 미들웨어의 `origin`에 프론트 주소만 명시, `credentials` 허용 여부 설정  
       → cors 패키지로 변경하여 더 다양한 cors 적용 가능하도록 함

- [ ] **Rate limiting 적용**  
       → `express-rate-limit`으로 전체 API 및 로그인/회원가입/비밀번호 재설정 요청 수 제한 적용

- [x] **입력값 검증(body/query/params)**  
       → Zod 등으로 body, query, params 검증, 예상하지 않은 값 차단

- [x] **의존성/환경변수 관리**  
       → 시크릿 키와 DB URL의 `.env` 분리, 패키지 업데이트 및 취약점 점검  
       → 취약점 점검용으로 `pnpm run audit:deps` 스크립트 추가(`pnpm audit --audit-level=high`). 릴리스 전/주기적으로 실행 권장.

---

### 인증 보안

- [x] **비밀번호 해시 저장(Argon2id 권장, bcrypt 가능)**  
       → 비밀번호 평문 저장 금지, Argon2id 또는 bcrypt 해시 적용  
       → **보완**: Google 등 소셜만 연동된 계정(`password` 없음)은 이메일 로그인 시 `bcrypt.compare` 전에 차단하고 동일하게 `INVALID_LOGIN` 반환

- [x] **로그인 실패 메시지 통일**  
       → 계정 존재 여부가 드러나지 않는 공통 에러 메시지 사용  
       → 사용자 없음·비밀번호 불일치·비밀번호 미설정 모두 `UnauthorizedException(ERROR_MESSAGE.INVALID_LOGIN)`

- [ ] **로그인 / 회원가입 / 비밀번호 재설정 요청 제한**  
       → IP 및 계정 기준 요청 횟수 제한, brute force 및 과도한 요청 방지

- [ ] **비밀번호 재설정 토큰 만료/1회용 처리**  
       → 랜덤 토큰 발급, 짧은 만료시간 설정, 1회용 처리 적용

- [x] **인증 후 세션/토큰 재발급**  
       → 로그인 성공 후 새 access/refresh token 또는 새 세션 ID 발급

---

### 세션 / 토큰 / 쿠키 보안

- [x] **쿠키에 HttpOnly, Secure, SameSite 설정**  
       → refresh token 쿠키에 `HttpOnly`, `Secure`, `SameSite` 속성 적용
      -> httpOnly: true, sameSite: 'lax', 프로덕션에서 secure: true

- [x] **access/refresh token 만료시간 분리**  
       → access token 단기 만료, refresh token 장기 만료 정책 적용
      -> access 15m, refresh 7d

- [x] **로그아웃 시 refresh token 폐기**  
       → 로그아웃 시 DB 또는 저장소의 refresh token 무효화 또는 삭제
      -> deleteRefreshToken()

- [ ] **세션 고정 방지**  
       → 로그인 전후 세션 식별자 분리, 인증 후 새 세션/토큰 발급

---

### 인가 보안

- [ ] **역할 기반 접근 제어(RBAC)**  
       → `USER`, `ADMIN` 등 역할별 접근 가능한 API와 기능 분리

- [ ] **리소스 소유자 검증**  
       → 수정/삭제 요청 시 작성자 또는 소유자 여부의 서버 측 검증

- [ ] **관리자 전용 기능 분리**  
       → 관리자 전용 라우트 및 서비스 로직 분리, 일반 사용자 접근 차단

- [ ] **서버 측 권한 체크 강제**  
       → 프론트 숨김 처리와 별개로 서버에서 최종 권한 판단 수행

---

### 브라우저 공격 대응

- [ ] **CSRF 대응**  
       → 쿠키 기반 인증 시 `SameSite` 설정, 필요 시 CSRF 토큰 또는 Origin 검증 적용

- [ ] **XSS 대응**  
       → 사용자 입력/출력 데이터의 escape 또는 sanitize 처리

- [ ] **CSP 등 보안 헤더 점검**  
       → `Content-Security-Policy` 등 보안 헤더의 서비스 구조 기반 점검 및 설정

- [ ] **상태 변경 요청에 GET 사용 금지**  
       → 생성/수정/삭제 작업의 POST/PATCH/DELETE 처리

---

### 운영 / 모니터링

- [ ] **로그인/보안 이벤트 로그 기록**  
       → 로그인 성공/실패, 비밀번호 재설정 요청, 관리자 기능 사용 로그 남기기

- [ ] **민감정보 로그 마스킹**  
       → 비밀번호, 토큰, 인증코드 등 민감정보 비기록 또는 마스킹 처리

- [ ] **비정상 요청 모니터링**  
       → 반복 로그인 실패, 짧은 시간 내 다량 요청, 이상한 IP/User-Agent 패턴 모니터링

- [ ] **차단 정책 운영**  
       → 반복 공격 감지 시 일정 시간 차단, 계정 잠금, 관리자 알림 적용
