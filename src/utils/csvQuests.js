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

export function downloadCsvTemplate() {
  const rows = [
    'act,name,reward,note,regular,semi_strict,uber,custom',
    'act1,보석의 굴레,패시브 포인트,예시 메모,true,true,false,false',
    'act2,또 다른 퀘스트,스킬 젬,,true,false,false,true',
  ];
  const blob = new Blob([BOM + rows.join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'poe2-quest-template.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToCsv(actsData, completed, customFilters) {
  const header = 'act,name,reward,note,regular,semi_strict,uber,custom,completed';
  const rows = [header];

  actsData.acts.forEach(act => {
    act.quests.forEach(quest => {
      if (!quest.id.startsWith('custom_')) return;
      const f = quest.filters || {};
      rows.push([
        act.id,
        quoteCsv(quest.name),
        quoteCsv(quest.reward),
        quoteCsv(quest.note),
        f.regular ? 'true' : 'false',
        f.semiStrict ? 'true' : 'false',
        f.uber ? 'true' : 'false',
        customFilters[quest.id] ? 'true' : 'false',
        completed.includes(quest.id) ? 'true' : 'false',
      ].join(','));
    });
  });

  const blob = new Blob([BOM + rows.join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `poe2-quests-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseCsv(csvText) {
  const text = csvText.replace(/^﻿/, '');
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return { items: [], errors: ['데이터가 없습니다.'] };

  const headers = parseCsvLine(lines[0]).map(h => h.trim().toLowerCase());
  const col = (name) => headers.indexOf(name);

  if (col('act') === -1 || col('name') === -1) {
    return { items: [], errors: ["필수 컬럼 'act'와 'name'이 필요합니다."] };
  }

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

    items.push({
      actId,
      quest: {
        id: `custom_${actId}_${now}_${i}`,
        name,
        reward: get('reward'),
        note: get('note'),
        filters: {
          regular: get('regular') !== 'false',
          semiStrict: get('semi_strict') === 'true',
          uber: get('uber') === 'true',
        },
      },
      isCustomFilter: get('custom') === 'true',
      isCompleted: get('completed') === 'true',
    });
  });

  return { items, errors };
}
