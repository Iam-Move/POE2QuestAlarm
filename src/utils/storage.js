import { DEFAULT_FILTER_DEFS } from './filters';

const STORAGE_KEY = 'poe2-quest-tracker';

export function saveState(state) {
  try {
    const data = {
      version: '2.0.0',
      filter: state.filter,
      completed: state.completed,
      filterDefs: state.filterDefs,
      customFilterSets: state.customFilterSets || {},
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

    // Migration: v1 customFilters → customFilterSets
    let customFilterSets = data.customFilterSets || {};
    if (data.customFilters && !data.customFilterSets) {
      customFilterSets = { custom: data.customFilters };
    }

    return {
      filter: data.filter || 'regular',
      completed: data.completed || [],
      filterDefs: data.filterDefs || DEFAULT_FILTER_DEFS,
      customFilterSets,
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
