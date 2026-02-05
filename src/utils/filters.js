// 필터링 로직

export function filterQuests(questsData, filterMode, customFilters = {}, isEditMode = false) {
  if (!questsData || !questsData.acts) return [];

  return questsData.acts
    .map(act => ({
      ...act,
      quests: act.quests.filter(quest => {
        // 편집 모드 + Custom 필터: 모든 퀘스트 표시
        if (isEditMode && filterMode === 'custom') {
          return true;
        }

        // 편집 모드 OFF + Custom 필터: customFilters에 true인 것만
        if (!isEditMode && filterMode === 'custom') {
          return customFilters[quest.id] === true;
        }

        // 다른 필터 모드는 기본 filters 사용
        return quest.filters && quest.filters[filterMode];
      })
    }))
    .filter(act => act.quests.length > 0); // 퀘스트가 없는 Act는 제외
}

export const FILTER_MODES = {
  REGULAR: 'regular',
  SEMI_STRICT: 'semiStrict',
  UBER: 'uber',
  CUSTOM: 'custom'
};

export const FILTER_LABELS = {
  regular: 'Regular',
  semiStrict: 'Semi-Strict',
  uber: 'Uber Strict',
  custom: 'Custom'
};

export const FILTER_COLORS = {
  regular: 'bg-poe-regular',
  semiStrict: 'bg-poe-semi',
  uber: 'bg-poe-uber',
  custom: 'bg-blue-500'
};
