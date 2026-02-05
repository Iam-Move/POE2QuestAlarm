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
