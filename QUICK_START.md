# Quick Start Guide - POE2 Quest Tracker

## 🚀 5분 안에 시작하기

### Step 1: 로컬에서 실행 (1분)

```bash
# 의존성 설치 (최초 1회만)
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 http://localhost:5173 열기

### Step 2: 기능 테스트 (2분)

1. **필터 전환**: Regular, Semi-Strict, Uber 버튼 클릭
2. **퀘스트 체크**: 체크박스 클릭하여 완료 표시
3. **진행률 확인**: Act별 및 전체 진행률 확인
4. **새로고침**: 페이지 새로고침 후 상태 유지 확인
5. **초기화**: "초기화" 버튼으로 전체 리셋

### Step 3: 배포 (2분)

```bash
# GitHub에 푸시
git init
git add .
git commit -m "Initial commit: POE2 Quest Tracker MVP"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/POE2QuestAlarm.git
git push -u origin main
```

Cloudflare Pages 설정:
1. https://dash.cloudflare.com/ 접속
2. Workers & Pages → Create → Connect to Git
3. 레포지토리 선택
4. Build command: `npm run build`
5. Build output: `dist`
6. Deploy!

---

## 📝 데이터 업데이트하기

### 빠른 방법 (직접 편집)

`public/data/quests.json` 파일을 에디터로 열고 수정:

```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-01-15",
  "acts": [
    {
      "id": "act1",
      "name": "Act 1: Ogham",
      "quests": [
        {
          "id": "a1q1",
          "name": "퀘스트 이름",
          "reward": "보상",
          "note": "팁",
          "filters": {
            "regular": true,
            "semiStrict": true,
            "uber": false
          }
        }
      ]
    }
  ]
}
```

### ID 네이밍 규칙

- Act ID: `act1`, `act2`, `act3`, ...
- Quest ID: `a[Act번호]q[퀘스트번호]`
  - 예: `a1q1`, `a2q5`, `a3q10`

### 필터 가이드

- **regular**: 모든 스킬 포인트 + 주요 젬
- **semiStrict**: regular에서 선택 퀘스트 제외
- **uber**: 절대 필수 퀘스트만

---

## 🎮 게임과 함께 사용하기

### 방법 1: 듀얼 모니터
- 게임: 메인 모니터
- 웹 앱: 보조 모니터

### 방법 2: 모바일/태블릿
- 게임: PC
- 웹 앱: 스마트폰/태블릿

### 방법 3: 창 모드
- 게임: 창 모드 (Alt+Enter)
- 웹 앱: 브라우저 창 옆에 배치

---

## 🔧 문제 해결

### 데이터가 안 보여요
- `public/data/quests.json` 파일 존재 확인
- JSON 문법 오류 확인 (https://jsonlint.com/)
- 브라우저 개발자 도구 Console 탭 확인

### 체크박스가 안 먹혀요
- localStorage 활성화 확인
- 시크릿 모드가 아닌지 확인
- 브라우저 캐시 삭제 후 재시도

### 빌드가 실패해요
```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📚 상세 가이드

더 자세한 내용은 다음 문서를 참고하세요:

- **README.md**: 프로젝트 개요
- **DEPLOYMENT.md**: Cloudflare Pages 배포 상세
- **DATA_UPDATE_GUIDE.md**: Google Sheets 연동
- **IMPLEMENTATION_SUMMARY.md**: 구현 완료 사항

---

## 💡 팁

1. **퀘스트 순서**: ID 순서대로 표시되므로 중요한 퀘스트를 앞에 배치
2. **진행률 활용**: Act별 진행률로 어떤 Act가 남았는지 한눈에 파악
3. **필터 전환**: 캐릭터 육성 단계에 맞춰 필터 전환
   - 첫 플레이: Regular
   - 2-3번째 캐릭: Semi-Strict
   - 속도 플레이: Uber
4. **백업**: 중요한 진행 상황은 localStorage 외에 스크린샷으로도 백업

---

## 🎯 체크리스트

### 개발 환경 구축
- [ ] Node.js 18+ 설치
- [ ] `npm install` 완료
- [ ] `npm run dev` 실행 확인
- [ ] 브라우저에서 동작 확인

### 데이터 준비
- [ ] `quests.json` 데이터 입력
- [ ] JSON 유효성 검증
- [ ] 각 필터 모드 테스트

### 배포
- [ ] GitHub 레포지토리 생성
- [ ] 코드 푸시
- [ ] Cloudflare Pages 연결
- [ ] 배포 URL 확인

### 사용
- [ ] 게임과 함께 테스트
- [ ] 진행 상황 저장 확인
- [ ] 모바일 반응형 확인

---

**도움이 필요하면 GitHub Issues에 문의하세요!**

Happy Hunting, Exile! 🎮
