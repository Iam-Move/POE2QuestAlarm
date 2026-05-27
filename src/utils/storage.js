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
      customActs: state.customActs || [],
      questOrder: state.questOrder || {},
      timerSeconds: state.timerSeconds || 0,
      timerStartedAt: state.timerStartedAt || null,
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

    // Timer: if it was running when saved, calculate elapsed and resume
    let timerSeconds = data.timerSeconds || 0;
    let timerStartedAt = data.timerStartedAt || null;
    let timerRunning = false;
    if (timerStartedAt) {
      const elapsed = Math.floor((Date.now() - timerStartedAt) / 1000);
      timerSeconds += elapsed;
      timerStartedAt = Date.now();
      timerRunning = true;
    }

    return {
      filter: data.filter || 'regular',
      completed: data.completed || [],
      filterDefs: data.filterDefs || DEFAULT_FILTER_DEFS,
      customFilterSets,
      customQuestData: data.customQuestData || {},
      customActs: data.customActs || [],
      questOrder: data.questOrder || {},
      timerSeconds,
      timerStartedAt,
      timerRunning,
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
