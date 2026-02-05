# Deployment Guide - Cloudflare Pages

## Prerequisites

1. GitHub 계정
2. Cloudflare 계정 (무료)
3. Git 설치

## Step 1: GitHub에 코드 푸시

```bash
# Git 초기화 (아직 안 했다면)
git init

# 파일 추가
git add .

# 첫 커밋
git commit -m "Initial commit: POE2 Quest Tracker MVP"

# 브랜치 이름 설정
git branch -M main

# GitHub 레포지토리 생성 후 연결
git remote add origin https://github.com/YOUR_USERNAME/POE2QuestAlarm.git

# 푸시
git push -u origin main
```

## Step 2: Cloudflare Pages 설정

1. Cloudflare 대시보드 접속: https://dash.cloudflare.com/
2. 좌측 메뉴에서 "Workers & Pages" 선택
3. "Create application" 버튼 클릭
4. "Pages" 탭 선택
5. "Connect to Git" 선택

## Step 3: GitHub 연결

1. "Connect GitHub" 클릭
2. 권한 허용
3. `POE2QuestAlarm` 레포지토리 선택
4. "Begin setup" 클릭

## Step 4: 빌드 설정

다음 설정을 입력합니다:

- **Project name**: `poe2-quest-tracker` (또는 원하는 이름)
- **Production branch**: `main`
- **Framework preset**: None (또는 Vite)
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/`

**Environment variables** (필요 없음):
- 현재 프로젝트는 환경 변수가 필요하지 않습니다.

## Step 5: 배포

1. "Save and Deploy" 버튼 클릭
2. 빌드 진행 상황 확인 (약 1-2분 소요)
3. 배포 완료 후 URL 확인: `https://your-project.pages.dev`

## Step 6: 커스텀 도메인 설정 (선택)

1. Cloudflare Pages 프로젝트 설정으로 이동
2. "Custom domains" 탭 선택
3. "Set up a custom domain" 클릭
4. 도메인 입력 및 DNS 설정 따라하기

## 자동 배포

GitHub의 `main` 브랜치에 푸시할 때마다 자동으로 재배포됩니다:

```bash
git add .
git commit -m "Update quests data"
git push
```

약 1-2분 후 변경 사항이 반영됩니다.

## 배포 확인 체크리스트

- [ ] 사이트가 정상적으로 로드됨
- [ ] 퀘스트 데이터가 표시됨
- [ ] 필터 전환이 동작함
- [ ] 체크박스 토글이 동작함
- [ ] 새로고침 후 상태가 유지됨
- [ ] 모바일에서 반응형 디자인 확인

## 문제 해결

### 빌드 실패

1. 로컬에서 `npm run build` 실행하여 에러 확인
2. `package.json`의 dependencies가 모두 설치되었는지 확인
3. Node.js 버전 확인 (18 이상 권장)

### 404 에러

- `dist` 폴더에 `index.html`이 있는지 확인
- Build output directory가 `dist`로 설정되었는지 확인

### 데이터가 로드되지 않음

- `public/data/quests.json` 파일이 존재하는지 확인
- 브라우저 개발자 도구의 Network 탭에서 404 에러 확인

## 성능 모니터링

Cloudflare Pages는 자동으로 다음을 제공합니다:

- **CDN**: 전 세계 엣지 서버에서 콘텐츠 제공
- **HTTPS**: 자동 SSL 인증서
- **Compression**: Gzip 및 Brotli 자동 압축
- **Analytics**: 방문자 통계 (무료)

## 비용

Cloudflare Pages 무료 플랜:

- ✅ 무제한 대역폭
- ✅ 무제한 사이트
- ✅ 500 빌드/월
- ✅ 1 빌드 동시 실행

현재 프로젝트는 완전히 무료로 운영 가능합니다!

## 추가 정보

- Cloudflare Pages 문서: https://developers.cloudflare.com/pages/
- Vite 문서: https://vitejs.dev/
- React 문서: https://react.dev/
