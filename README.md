# 삼성전기 전사AI 활용 교육 · 강사 가이드 (Netlify 배포용)

주강사용/보조강사용 가이드를 비밀번호로 보호된 웹페이지로 제공합니다.

- **조회 비밀번호**로 로그인 → 두 가이드를 읽기 전용으로 확인 (`/view.html`)
- **관리자 비밀번호**로 로그인 → 내용을 직접 수정하고 저장 (`/admin.html`)
- 저장된 내용은 Netlify Blobs(사이트에 내장된 저장소)에 보관되어, 이후 접속하는 모든 사람에게 최신 버전이 보입니다.

## 폴더 구조

```
site/
├─ public/                 # 정적 프론트엔드 (로그인, 조회, 관리자 편집 화면)
│  ├─ index.html
│  ├─ view.html
│  ├─ admin.html
│  └─ assets/styles.css
├─ netlify/functions/       # 서버리스 백엔드
│  ├─ login.js              # 비밀번호 검증 후 세션 쿠키 발급
│  ├─ logout.js
│  ├─ content.js             # 가이드 내용 조회(GET)/수정(PUT, 관리자만)
│  └─ utils/
│     ├─ auth.js             # 세션 쿠키 서명/검증
│     └─ seed.js             # 최초 배포 시 기본으로 보여줄 가이드 원문(초안)
├─ netlify.toml
├─ package.json
└─ .env.example
```

## 배포 방법 (Netlify)

### 1) 이 폴더를 Git 저장소로 만들어 GitHub 등에 올리기

```bash
cd site
git init
git add .
git commit -m "init: 삼성전기 AI교육 강사 가이드"
git remote add origin <본인의 저장소 URL>
git push -u origin main
```

### 2) Netlify에서 새 사이트 생성

1. https://app.netlify.com 접속 → **Add new site → Import an existing project**
2. 방금 올린 Git 저장소 선택
3. Build settings는 기본값 그대로 두어도 됩니다(별도 빌드 명령 없음, publish directory는 `public`으로 `netlify.toml`에 이미 지정되어 있습니다).
4. **Deploy site** 클릭

### 3) 환경변수 설정 (필수)

Netlify 사이트 대시보드 → **Site configuration → Environment variables** 에서 아래 3개를 등록하세요 (`.env.example` 참고).

| 변수명 | 설명 |
|---|---|
| `VIEW_PASSWORD` | 조회 전용 접속 비밀번호 |
| `ADMIN_PASSWORD` | 수정 가능한 관리자 접속 비밀번호 |
| `SESSION_SECRET` | 로그인 세션 서명용 임의의 긴 랜덤 문자열(외부에 공개되지 않도록 주의) |

환경변수를 저장한 뒤 **Deploys → Trigger deploy → Deploy site**로 한 번 다시 배포해야 함수에 반영됩니다.

### 4) Netlify Blobs 활성화 확인

최근 버전의 Netlify는 사이트를 만들면 Blobs 저장소가 자동으로 사용 가능합니다. 별도 설정 없이 바로 동작하며,
만약 `content` 함수 호출 시 Blobs 관련 오류가 발생하면 Netlify 대시보드의 **Site configuration → Environment variables**
아래쪽 또는 **Integrations**에서 Blobs가 활성화되어 있는지 확인해 주세요.

### 5) 접속 확인

배포가 끝나면 Netlify가 부여한 주소(예: `https://your-site-name.netlify.app`)로 접속해
로그인 화면이 뜨는지 확인합니다. 조회 비밀번호로 들어가면 읽기 전용 화면, 관리자 비밀번호로 들어가면
편집 화면(`/admin.html`)으로 이동합니다.

원하시면 Netlify 사이트 설정에서 커스텀 도메인(예: `guide.samsungemc-training.com` 등)도 연결할 수 있습니다.

## 로컬에서 미리 테스트해보기 (선택)

Netlify CLI가 설치되어 있다면:

```bash
npm install
npm i -g netlify-cli   # 이미 있다면 생략
netlify dev
```

`.env` 파일을 만들어 `.env.example` 내용을 채운 뒤 실행하면 `http://localhost:8888` 에서 동일하게 테스트할 수 있습니다.
(로컬 환경에서는 Netlify Blobs 대신 임시 로컬 저장소가 쓰일 수 있어, 실제 배포본과 저장 데이터가 공유되지는 않습니다.)

## 주의사항

- 이 방식은 "사이트 전체를 아무나 볼 수 없게" 막는 것이 아니라, **애플리케이션 레벨에서 로그인 세션(쿠키)으로 조회/관리자 권한을 구분**하는 방식입니다.
  사내 극비 문서 수준의 강한 보안이 필요하다면 Netlify 자체의 Password Protection(유료 플랜의 사이트 단위 비밀번호) 또는 SSO 연동을 추가로 검토해 주세요.
- `SESSION_SECRET`, `VIEW_PASSWORD`, `ADMIN_PASSWORD`는 저장소에 커밋하지 말고 반드시 Netlify 환경변수로만 관리해 주세요.
- 관리자 화면에서 저장한 내용은 이 사이트를 보는 모든 사용자에게 즉시 반영됩니다(개인별 버전이 아님).
