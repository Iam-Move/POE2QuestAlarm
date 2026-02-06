# POE2 Quest Tracker

Path of Exile 2 플레이어를 위한 무료 웹 기반 퀘스트 네비게이션 도구

## 특징

- ✅ **필터 시스템**: Regular, Semi-Strict, Uber Strict 모드
- 📊 **진행률 추적**: Act별 및 전체 완료율 표시
- 💾 **자동 저장**: localStorage를 통한 진행 상황 저장
- 🎨 **다크 테마**: POE2 스타일의 UI/UX
- 📱 **반응형 디자인**: 모바일, 태블릿, 데스크톱 지원
- 🚀 **빠른 로딩**: 정적 JSON 기반, 서버리스 아키텍처

## 기술 스택

- React 18
- Vite
- Tailwind CSS
- LZ-String (압축)

## 로컬 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview
```

## 배포

이 프로젝트는 Cloudflare Pages에 배포하도록 설계되었습니다.

### Cloudflare Pages 배포 설정

- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/`
- **Node version**: 18 이상

## 프로젝트 구조

```
POE2QuestAlarm/
├── public/
│   └── data/
│       └── quests.json          # 퀘스트 데이터
├── src/
│   ├── components/              # React 컴포넌트
│   │   ├── FilterBar.jsx        # 필터 선택 UI
│   │   ├── ActGroup.jsx         # Act별 그룹
│   │   └── QuestCard.jsx        # 퀘스트 카드
│   ├── utils/                   # 유틸리티 함수
│   │   ├── storage.js           # localStorage 관리
│   │   └── filters.js           # 필터링 로직
│   ├── App.jsx                  # 메인 앱
│   ├── main.jsx                 # 엔트리 포인트
│   └── index.css                # 스타일
└── package.json
```

## 데이터 구조

`public/data/quests.json` 파일은 다음 형식을 따릅니다:

```json
{
  "version": "1.0.0",
  "acts": [
    {
      "id": "act1",
      "name": "Act 1: Ogham",
      "quests": [
        {
          "id": "a1q1",
          "name": "퀘스트 이름",
          "reward": "보상",
          "note": "팁 및 가이드",
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

## 향후 계획

- [ ] 타이머
- [ ] 오류 수정


## 라이선스

GNU General Public License v3.0

## 기여

이슈 및 PR은 언제나 환영합니다!
