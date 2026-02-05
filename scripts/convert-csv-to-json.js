import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import iconv from 'iconv-lite';
import csv from 'csv-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const csvPath = path.join(__dirname, '../public/data/IamMove.csv');
const outputPath = path.join(__dirname, '../public/data/quests.json');

const results = [];

// EUC-KR 인코딩으로 CSV 파일 읽기
const stream = fs.createReadStream(csvPath)
  .pipe(iconv.decodeStream('euc-kr'))
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', () => {
    console.log('CSV 파싱 완료. 총', results.length, '개의 퀘스트');

    // Act별로 그룹화
    const actMap = new Map();

    results.forEach((row) => {
      const actName = row.act?.trim();
      if (!actName) return;

      if (!actMap.has(actName)) {
        actMap.set(actName, []);
      }

      actMap.get(actName).push({
        waypoint: row.waypoint?.trim() || '',
        name: row.name?.trim() || '',
        reward: row.reward?.trim() || '',
        note: row.note?.trim() || '',
        filters: {
          regular: row.Regular?.toUpperCase() === 'TRUE',
          semiStrict: row['Semi-Strict']?.toUpperCase() === 'TRUE',
          uber: row.Uber?.toUpperCase() === 'TRUE',
          custom: row.Custom?.toUpperCase() === 'TRUE'
        }
      });
    });

    // JSON 구조 생성
    const acts = [];
    let questIdCounter = 1;

    actMap.forEach((quests, actName) => {
      const actId = actName.toLowerCase()
        .replace(/act\s*/gi, 'act')
        .replace(/추가\s*/gi, 'extra')
        .replace(/\s+/g, '');

      const formattedQuests = quests.map((quest) => {
        const questId = `q${questIdCounter++}`;
        return {
          id: questId,
          waypoint: quest.waypoint,
          name: quest.name,
          reward: quest.reward,
          note: quest.note,
          filters: quest.filters
        };
      });

      acts.push({
        id: actId,
        name: actName,
        quests: formattedQuests
      });
    });

    const questsData = {
      version: '1.0.0',
      lastUpdated: new Date().toISOString().split('T')[0],
      acts: acts
    };

    // JSON 파일로 저장
    fs.writeFileSync(outputPath, JSON.stringify(questsData, null, 2), 'utf-8');

    console.log('✅ JSON 변환 완료:', outputPath);
    console.log('총', acts.length, '개의 Act');
    console.log('총', questIdCounter - 1, '개의 퀘스트');
  })
  .on('error', (error) => {
    console.error('❌ CSV 파싱 에러:', error);
  });
