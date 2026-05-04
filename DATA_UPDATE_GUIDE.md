# 퀘스트 데이터 업데이트 가이드

## Google Sheets에서 JSON으로 변환하기

### 방법 1: 수동 변환 (가장 간단)

#### 1단계: Google Sheets에서 CSV 다운로드

1. Google Sheets 열기: https://docs.google.com/spreadsheets/d/1duPlJcxPR9vveaZbMgJEiyNkpbFIj-yDnw6muF6j5Zs/edit
2. **File** → **Download** → **Comma Separated Values (.csv)**
3. 파일 저장

#### 2단계: CSV를 JSON으로 변환

온라인 도구 사용:
- https://csvjson.com/csv2json
- https://www.convertcsv.com/csv-to-json.htm

또는 아래 스크립트 사용 (Node.js 필요):

```javascript
// csv-to-json.js
const fs = require('fs');
const csv = require('csv-parser');

const results = [];

fs.createReadStream('input.csv')
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', () => {
    // JSON 구조로 변환
    const questsData = {
      version: "1.0.0",
      lastUpdated: new Date().toISOString().split('T')[0],
      acts: []
    };

    // 데이터 처리 로직
    // ...

    fs.writeFileSync('quests.json', JSON.stringify(questsData, null, 2));
    console.log('JSON 변환 완료!');
  });
```

#### 3단계: JSON 파일 복사

변환된 JSON 파일을 다음 경로에 복사:
```
public/data/quests.json
```

### 방법 2: 직접 편집 (소규모 변경)

`public/data/quests.json` 파일을 텍스트 에디터로 직접 편집:

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

## JSON 스키마 설명

### 최상위 구조

```json
{
  "version": "1.0.0",           // 데이터 버전
  "lastUpdated": "2025-01-15",  // 마지막 업데이트 날짜
  "acts": []                    // Act 배열
}
```

### Act 구조

```json
{
  "id": "act1",                 // 고유 ID (act1, act2, ...)
  "name": "Act 1: Ogham",       // 표시될 이름
  "quests": []                  // 퀘스트 배열
}
```

### Quest 구조

```json
{
  "id": "a1q1",                 // 고유 ID (actID + q + 번호)
  "name": "퀘스트 이름",         // 퀘스트 이름
  "reward": "보상",             // 보상 설명
  "note": "팁 및 가이드",        // 추가 정보 (선택)
  "filters": {
    "regular": true,            // Regular 필터에 포함 여부
    "semiStrict": true,         // Semi-Strict 필터에 포함 여부
    "uber": false               // Uber Strict 필터에 포함 여부
  }
}
```

## 필터 가이드라인

### Regular (일반 플레이)
- 모든 스킬 포인트 퀘스트
- 주요 스킬/서포트 젬 퀘스트
- 어센던시 관련 퀘스트
- 스토리 진행 필수 퀘스트

### Semi-Strict (효율 플레이)
- Regular의 모든 퀘스트
- 단, 선택 보상 퀘스트는 제외
- 시간 대비 효율이 낮은 퀘스트 제외

### Uber Strict (속도 플레이)
- 절대적으로 필수인 퀘스트만
- 스킬 포인트 퀘스트
- 어센던시 퀘스트
- Act 진행에 필수인 퀘스트만

## 검증 방법

### 1. JSON 문법 검증

온라인 도구 사용:
- https://jsonlint.com/
- VSCode의 JSON 검증 기능

### 2. 로컬 테스트

```bash
# 개발 서버 실행
npm run dev

# 브라우저에서 http://localhost:5173 열기
# 각 필터 모드에서 퀘스트가 올바르게 표시되는지 확인
```

### 3. 빌드 테스트

```bash
# 프로덕션 빌드
npm run build

# 미리보기
npm run preview
```

## 배포

데이터를 업데이트한 후:

```bash
# 변경 사항 커밋
git add public/data/quests.json
git commit -m "Update quest data: 새로운 Act 추가"

# GitHub에 푸시
git push

# Cloudflare Pages가 자동으로 재배포 (1-2분 소요)
```

## 일반적인 문제

### JSON 문법 오류

**증상**: 빌드 실패 또는 데이터 로드 안 됨

**해결**:
- JSON 유효성 검사기 사용
- 따옴표, 쉼표, 중괄호 확인
- 마지막 항목 뒤에 쉼표가 없는지 확인

### ID 중복

**증상**: 퀘스트가 중복 표시되거나 체크박스 동작 오류

**해결**:
- 모든 quest ID가 고유한지 확인
- 네이밍 규칙 준수: `a[Act번호]q[퀘스트번호]`

### 필터 설정 누락

**증상**: 특정 필터에서 퀘스트가 표시되지 않음

**해결**:
- 모든 퀘스트에 `filters` 객체가 있는지 확인
- `regular`, `semiStrict`, `uber` 세 가지 필드 모두 존재하는지 확인

## 자동화 (고급)

### GitHub Actions를 통한 자동 변환

나중에 필요하면 GitHub Actions를 설정하여:
1. Google Sheets에서 자동으로 데이터 가져오기
2. CSV → JSON 변환
3. 자동 커밋 및 배포

현재는 수동 업데이트로 충분하며, 필요 시 추가 구현 가능합니다.

## 팁

- 데이터 업데이트 전 백업 생성
- 대규모 변경 시 브랜치 생성 후 테스트
- 커밋 메시지에 변경 내용 명시
- 주기적으로 `lastUpdated` 날짜 업데이트
