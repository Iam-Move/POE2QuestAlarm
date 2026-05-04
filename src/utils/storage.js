// localStorage 관리 유틸리티

const STORAGE_KEY = 'poe2-quest-tracker';

export function saveState(state) {
  try {
    const data = {
      version: '1.0.0',
      filter: state.filter,
      completed: state.completed,
      customFilters: state.customFilters || {},
      customQuestData: state.customQuestData || {},
      questOrder: state.questOrder || {}
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save state:', error);
  }
}

export function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;

    const data = JSON.parse(saved);
    return {
      filter: data.filter || 'regular',
      completed: data.completed || [],
      customFilters: data.customFilters || {},
      customQuestData: data.customQuestData || {},
      questOrder: data.questOrder || {}
    };
  } catch (error) {
    console.error('Failed to load state:', error);
    return null;
  }
}

export function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear state:', error);
  }
}

export function exportState(state) {
  const data = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    filter: state.filter,
    completed: state.completed,
    customFilters: state.customFilters || {},
    customQuestData: state.customQuestData || {},
    questOrder: state.questOrder || {}
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const date = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `poe2-backup-${date}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importState(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        resolve({
          filter: data.filter || 'regular',
          completed: data.completed || [],
          customFilters: data.customFilters || {},
          customQuestData: data.customQuestData || {},
          questOrder: data.questOrder || {}
        });
      } catch {
        reject(new Error('올바른 백업 파일이 아닙니다.'));
      }
    };
    reader.onerror = () => reject(new Error('파일을 읽을 수 없습니다.'));
    reader.readAsText(file);
  });
}
