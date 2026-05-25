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
  const customFilterDefs = filterDefs.filter(f => f.type === 'custom');
  const customCols = customFilterDefs.length > 0 ? customFilterDefs.map(f => f.name) : ['Custom'];

  const header = ['act', 'name', 'reward', 'note', 'regular', 'semi_strict', 'uber', ...customCols].join(',');
  const row1 = ['act1', '보석의 굴레', '패시브 포인트', '예시 메모', 'true', 'true', 'false', ...customCols.map(() => 'false')].join(',');
  const row2 = ['act2', '또 다른 퀘스트', '스킬 젬', '', 'true', 'false', 'false', ...customCols.map(() => 'true')].join(',');

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

  const customFilterDefs = filterDefs.filter(f => f.type === 'custom');
  const header = [
    'act', 'name', 'reward', 'note', 'regular', 'semi_strict', 'uber',
    ...customFilterDefs.map(f => quoteCsv(f.name)),
    'completed'
  ].join(',');

  const rows = [header];

  actsData.acts.forEach(act => {
    act.quests.forEach(quest => {
      if (!quest.id.startsWith('custom_')) return;

      const f = quest.filters || {};
      if (isCustomType) {
        if (!activeCustomSet[quest.id]) return;
      } else {
        if (!f[activeFilter]) return;
      }

      rows.push([
        act.id,
        quoteCsv(quest.name),
        quoteCsv(quest.reward),
        quoteCsv(quest.note),
        f.regular ? 'true' : 'false',
        f.semiStrict ? 'true' : 'false',
        f.uber ? 'true' : 'false',
        ...customFilterDefs.map(fd => {
          const set = customFilterSets[fd.id] || {};
          return set[quest.id] ? 'true' : 'false';
        }),
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

  // Detect custom filter columns (anything not in the known fixed set)
  // Use original-case names so they can be matched against filter def names
  const originalHeaders = parseCsvLine(lines[0]).map(h => h.trim());
  const knownCols = new Set(['act', 'name', 'reward', 'note', 'regular', 'semi_strict', 'uber', 'completed']);
  const customFilterCols = originalHeaders.filter(h => !knownCols.has(h.toLowerCase()));

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

    // Match original-case custom filter column name to values (use lowercased header for lookup)
    const customFilterNames = customFilterCols.filter(originalCol => {
      const idx = headers.indexOf(originalCol.toLowerCase());
      return idx >= 0 && (values[idx] ?? '').trim() === 'true';
    });

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
      customFilterNames,
      isCompleted: get('completed') === 'true',
    });
  });

  return { items, errors };
}
