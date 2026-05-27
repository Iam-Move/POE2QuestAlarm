export const DEFAULT_FILTER_DEFS = [
  { id: 'regular',    name: 'Regular',    type: 'builtin', visible: true },
  { id: 'semiStrict', name: 'Semi-Strict', type: 'builtin', visible: true },
  { id: 'uber',       name: 'Uber',       type: 'builtin', visible: true },
  { id: 'custom',     name: 'Custom',     type: 'custom',  visible: true },
];

export function filterQuests(questsData, activeFilter, filterDefs, customFilterSets, isEditMode = false) {
  if (!questsData || !questsData.acts) return [];

  const activeDef = filterDefs.find(f => f.id === activeFilter);
  const isCustomType = activeDef?.type === 'custom';
  const activeCustomSet = isCustomType ? (customFilterSets[activeFilter] || {}) : {};

  return questsData.acts
    .map(act => ({
      ...act,
      quests: act.quests.filter(quest => {
        if (isCustomType) {
          if (isEditMode && !activeDef?.csvOnly) return true;
          return activeCustomSet[quest.id] === true;
        }
        return quest.filters && quest.filters[activeFilter];
      })
    }))
    .filter(act => act.quests.length > 0);
}
