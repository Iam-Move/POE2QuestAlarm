const BOM = '﻿';

function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === ',' && !inQuotes) {
      result.push(current); current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

function quoteCsv(value) {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

export function downloadCsvTemplate(filterDefs = []) {
  const header = ['Act(필수)', 'Waypoint(필수)', 'Quest(필수)', 'Reward(선택)', 'Memo(선택)', '필터명(수정가능)'].join(',');
  const row1 = ['act1', '클리어펠 야영지', '보석의 굴레', '패시브 포인트', '예시 메모', 'true'].join(',');
  const row2 = ['act2', '폭풍 해안', '또 다른 퀘스트', '스킬 젬', '', 'false'].join(',');

  const blob = new Blob([BOM + [header, row1, row2].join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'poe2-quest-template.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToCsv(actsData, completed, filterDefs, customFilterSets, activeFilter) {
  if (!actsData) return;

  const activeDef = filterDefs.find(f => f.id === activeFilter);
  const isCustomType = activeDef?.type === 'custom';
  const activeCustomSet = isCustomType ? (customFilterSets[activeFilter] || {}) : {};

  const activeFilterCol = isCustomType ? [quoteCsv(activeDef.name)] : [];
  const header = [
    'Act(필수)', 'Waypoint(필수)', 'Quest(필수)', 'Reward(선택)', 'Memo(선택)',
    ...activeFilterCol,
    '진행도(false=미완료/공유시 false 권장)'
  ].join(',');

  const filterKeyMap = { regular: 'regular', semi_strict: 'semiStrict', uber: 'uber' };

  const rows = [header];

  actsData.acts.forEach(act => {
    act.quests.forEach(quest => {
      const f = quest.filters || {};

      if (isCustomType) {
        if (!activeCustomSet[quest.id]) return;
      } else {
        const filterKey = filterKeyMap[activeFilter] ?? activeFilter;
        if (!f[filterKey]) return;
      }

      rows.push([
        act.id,
        quoteCsv(quest.waypoint || ''),
        quoteCsv(quest.name),
        quoteCsv(quest.reward),
        quoteCsv(quest.note),
        ...(isCustomType ? ['true'] : []),
        completed.includes(quest.id) ? 'true' : 'false',
      ].join(','));
    });
  });

  const safeFilterName = (activeDef?.name || activeFilter).replace(/[\\/:*?"<>|]/g, '_');
  const date = new Date().toISOString().slice(0, 10);

  const blob = new Blob([BOM + rows.join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${safeFilterName}-${date}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseCsv(csvText) {
  const text = csvText.replace(/^﻿/, '');
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return { items: [], errors: ['데이터가 없습니다.'] };

  const rawHeaders = parseCsvLine(lines[0]);
  const originalHeaders = rawHeaders.map(h => h.trim());

  const normalizeHeader = (h) => {
    const lower = h.toLowerCase().split('(')[0].trim();
    if (lower === 'quest') return 'name';
    if (lower === 'memo') return 'note';
    if (lower === 'location') return 'waypoint';
    if (lower === '진행도') return 'completed';
    return lower;
  };
  const headers = originalHeaders.map(normalizeHeader);

  const col = (name) => headers.indexOf(name);

  if (col('act') === -1 || col('name') === -1) {
    return { items: [], errors: ["필수 컬럼 'Act(필수)'와 'Quest(필수)'이 필요합니다."] };
  }

  const knownCols = new Set([
    'act', 'name', 'quest', 'waypoint', 'location', 'reward', 'note', 'memo',
    'regular', 'semi_strict', 'uber', 'completed', '진행도', '필터명'
  ]);
  const customFilterCols = originalHeaders.filter(h => !knownCols.has(normalizeHeader(h)));

  const items = [];
  const errors = [];
  const now = Date.now();

  lines.slice(1).forEach((line, i) => {
    const values = parseCsvLine(line);
    const get = (name) => {
      const idx = col(name);
      return idx >= 0 ? (values[idx] ?? '').trim() : '';
    };

    const actId = get('act');
    const name = get('name');

    if (!actId) { errors.push(`${i + 2}행: act가 비어있습니다`); return; }
    if (!name) { errors.push(`${i + 2}행: name이 비어있습니다`); return; }

    const customFilterNames = customFilterCols.filter(originalCol => {
      const idx = originalHeaders.indexOf(originalCol);
      return idx >= 0 && (values[idx] ?? '').trim().toLowerCase() === 'true';
    });

    items.push({
      actId,
      quest: {
        id: `custom_${actId}_${now}_${i}`,
        name,
        waypoint: get('waypoint'),
        reward: get('reward'),
        note: get('note'),
        filters: {
          regular: get('regular').toLowerCase() === 'true',
          semiStrict: get('semi_strict').toLowerCase() === 'true',
          uber: get('uber').toLowerCase() === 'true',
        },
      },
      customFilterNames,
      isCompleted: get('completed').toLowerCase() === 'true',
    });
  });

  return { items, errors };
}
