import { useState, useEffect } from 'react';
import FilterBar from './components/FilterBar';
import ActGroup from './components/ActGroup';
import ShareButton from './components/ShareButton';
import EditModeToggle from './components/EditModeToggle';
import SharedSettingsAlert from './components/SharedSettingsAlert';
import PIPOverlay from './components/PIPOverlay';
import GuideModal from './components/GuideModal';
import DataModal from './components/DataModal';
import Logo from './components/Logo';
import Timer from './components/Timer';
import ResetModal from './components/ResetModal';
import { filterQuests, DEFAULT_FILTER_DEFS } from './utils/filters';
import { saveState, loadState, clearState } from './utils/storage';
import { decodeStateFromUrl } from './utils/share';
import { openPipWindow, closePipWindow, isPipSupported, isPipWindowOpen } from './utils/pip';

function App() {
  const [questsData, setQuestsData] = useState(null);
  const [filter, setFilter] = useState('regular');
  const [completed, setCompleted] = useState([]);
  const [filterDefs, setFilterDefs] = useState(DEFAULT_FILTER_DEFS);
  const [customFilterSets, setCustomFilterSets] = useState({});
  const [customQuestData, setCustomQuestData] = useState({});
  const [questOrder, setQuestOrder] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pipWindow, setPipWindow] = useState(null);
  const [pipError, setPipError] = useState(null);
  const [sharedSettings, setSharedSettings] = useState(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [newlyAddedQuestId, setNewlyAddedQuestId] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerStartedAt, setTimerStartedAt] = useState(null);
  const [undoStack, setUndoStack] = useState([]);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [customActs, setCustomActs] = useState([]);
  const [actOverrides, setActOverrides] = useState({});
  const [actOrder, setActOrder] = useState([]);

  useEffect(() => {
    const sharedState = decodeStateFromUrl(window.location.hash);

    if (sharedState) {
      setSharedSettings(sharedState);
    } else {
      const savedState = loadState();
      if (savedState) {
        setFilter(savedState.filter);
        setCompleted(savedState.completed);
        setFilterDefs(savedState.filterDefs || DEFAULT_FILTER_DEFS);
        setCustomFilterSets(savedState.customFilterSets || {});
        setCustomQuestData(savedState.customQuestData || {});
        setCustomActs(savedState.customActs || []);
        setActOverrides(savedState.actOverrides || {});
        setActOrder(savedState.actOrder || []);
        setQuestOrder(savedState.questOrder || {});
        setTimerSeconds(savedState.timerSeconds || 0);
        setTimerStartedAt(savedState.timerStartedAt || null);
        setTimerRunning(savedState.timerRunning || false);
      }
    }

    fetch('/data/quests.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load quest data');
        return res.json();
      })
      .then(data => {
        setQuestsData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!loading) {
      saveState({ filter, completed, filterDefs, customFilterSets, customQuestData, customActs, actOverrides, actOrder, questOrder, timerSeconds, timerStartedAt });
    }
  }, [filter, completed, filterDefs, customFilterSets, customQuestData, customActs, actOverrides, actOrder, questOrder, timerSeconds, timerStartedAt, loading]);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const handleToggleQuest = (questId) => {
    const wasCompleted = completed.includes(questId);
    setCompleted(prev => wasCompleted ? prev.filter(id => id !== questId) : [...prev, questId]);
    setUndoStack(prev => [...prev.slice(-9), { questId, wasCompleted }]);
  };

  const handleUndo = () => {
    setUndoStack(prev => {
      if (prev.length === 0) return prev;
      const { questId, wasCompleted } = prev[prev.length - 1];
      setCompleted(c => wasCompleted ? [...c, questId] : c.filter(id => id !== questId));
      return prev.slice(0, -1);
    });
  };

  const handleTimerStart = () => {
    setTimerStartedAt(Date.now());
    setTimerRunning(true);
  };

  const handleTimerStop = () => {
    if (timerStartedAt) {
      const elapsed = Math.floor((Date.now() - timerStartedAt) / 1000);
      setTimerSeconds(prev => prev + elapsed);
    }
    setTimerStartedAt(null);
    setTimerRunning(false);
  };

  const handleTimerReset = () => {
    setTimerSeconds(0);
    setTimerRunning(false);
    setTimerStartedAt(null);
  };

  const handleTimerEdit = (newSeconds) => {
    setTimerSeconds(newSeconds);
  };

  const handleFullReset = () => {
    setCompleted([]);
    setFilterDefs(DEFAULT_FILTER_DEFS);
    setCustomFilterSets({});
    setCustomQuestData({});
    setCustomActs([]);
    setActOverrides({});
    setActOrder([]);
    setQuestOrder({});
    setTimerSeconds(0);
    setTimerRunning(false);
    setTimerStartedAt(null);
    setUndoStack([]);
    clearState();
  };

  const handleProgressReset = (actIds) => {
    if (!actIds) {
      setCompleted([]);
      return;
    }
    const targetIds = new Set(
      (mergedQuestsData?.acts || [])
        .filter(a => actIds.includes(a.id))
        .flatMap(a => a.quests.map(q => q.id))
    );
    setCompleted(prev => prev.filter(id => !targetIds.has(id)));
  };

  const handleReset = () => {
    if (window.confirm('모든 진행 상황을 초기화하시겠습니까?')) {
      setCompleted([]);
      setCustomFilterSets({});
      clearState();
    }
  };

  const handleCsvImport = (items, includeCompleted) => {
    const validActIds = new Set(mergedQuestsData?.acts.map(a => a.id) || []);
    const newCustomQuestData = { ...customQuestData };
    const newQuestOrder = { ...questOrder };
    const newCustomFilterSets = { ...customFilterSets };
    const newCompleted = [...completed];
    let newFilterDefs = [...filterDefs];

    // Pre-collect unique custom filter names and create missing filter tabs
    const allCustomFilterNames = new Set();
    items.forEach(item => (item.customFilterNames || []).forEach(n => allCustomFilterNames.add(n)));

    const filterNameToId = {};
    let createIdx = 0;
    allCustomFilterNames.forEach(name => {
      const existing = newFilterDefs.find(
        f => f.type === 'custom' && f.name.toLowerCase() === name.toLowerCase()
      );
      if (existing) {
        filterNameToId[name] = existing.id;
      } else {
        const id = `cus_${Date.now()}_${createIdx++}`;
        newFilterDefs.push({ id, name, type: 'custom', visible: true, csvOnly: true });
        filterNameToId[name] = id;
      }
    });

    // Collect new act definitions for unknown actIds
    const newActsMap = new Map();
    const existingCustomActIds = new Set(customActs.map(a => a.id));

    const byAct = {};
    items.forEach(item => {
      if (!byAct[item.actId]) byAct[item.actId] = [];
      byAct[item.actId].push(item);
      if (!validActIds.has(item.actId) && !existingCustomActIds.has(item.actId)) {
        newActsMap.set(item.actId, { id: item.actId, name: item.actId });
      }
    });

    Object.entries(byAct).forEach(([actId, actItems]) => {
      const currentAct = mergedQuestsData?.acts.find(a => a.id === actId);
      const currentIds = newQuestOrder[actId] || (currentAct ? currentAct.quests.map(q => q.id) : []);
      const newIds = [...currentIds];

      actItems.forEach(({ quest, customFilterNames, isCompleted: questCompleted }) => {
        newCustomQuestData[quest.id] = quest;
        newIds.push(quest.id);

        (customFilterNames || []).forEach(name => {
          const targetId = filterNameToId[name];
          if (targetId) {
            if (!newCustomFilterSets[targetId]) newCustomFilterSets[targetId] = {};
            newCustomFilterSets[targetId][quest.id] = true;
          }
        });

        if (includeCompleted && questCompleted && !newCompleted.includes(quest.id)) {
          newCompleted.push(quest.id);
        }
      });

      newQuestOrder[actId] = newIds;
    });

    if (newActsMap.size > 0) {
      setCustomActs(prev => {
        const existingIds = new Set(prev.map(a => a.id));
        const toAdd = [...newActsMap.values()].filter(a => !existingIds.has(a.id));
        return [...prev, ...toAdd];
      });
    }
    setCustomQuestData(newCustomQuestData);
    setQuestOrder(newQuestOrder);
    setCustomFilterSets(newCustomFilterSets);
    setFilterDefs(newFilterDefs);
    if (includeCompleted) setCompleted(newCompleted);
  };

  const handleToggleFilterMembership = (questId) => {
    setCustomFilterSets(prev => ({
      ...prev,
      [filter]: {
        ...(prev[filter] || {}),
        [questId]: !(prev[filter] || {})[questId]
      }
    }));
  };

  const handleRenameAct = (actId, newName) => {
    setActOverrides(prev => ({ ...prev, [actId]: newName }));
  };

  const handleDeleteAct = (actId) => {
    setCustomActs(prev => prev.filter(a => a.id !== actId));
    setCustomQuestData(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(id => { if (id.startsWith(`custom_${actId}_`)) delete next[id]; });
      return next;
    });
    setCustomFilterSets(prev => {
      const next = {};
      Object.entries(prev).forEach(([fid, set]) => {
        const s = { ...set };
        Object.keys(s).forEach(qid => { if (qid.startsWith(`custom_${actId}_`)) delete s[qid]; });
        next[fid] = s;
      });
      return next;
    });
    setQuestOrder(prev => { const n = { ...prev }; delete n[actId]; return n; });
    setActOrder(prev => prev.filter(id => id !== actId));
    setActOverrides(prev => { const n = { ...prev }; delete n[actId]; return n; });
  };

  const handleMoveAct = (actId, direction) => {
    const allActIds = (mergedQuestsData?.acts || []).map(a => a.id);
    const currentOrder = actOrder.length > 0 ? actOrder : allActIds;
    const idx = currentOrder.indexOf(actId);
    if (idx === -1) return;
    const newOrder = [...currentOrder];
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= newOrder.length) return;
    [newOrder[idx], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[idx]];
    setActOrder(newOrder);
  };

  const handleBulkSetFilterMembership = (questIds, value) => {
    setCustomFilterSets(prev => {
      const current = prev[filter] || {};
      const updated = { ...current };
      questIds.forEach(id => { updated[id] = value; });
      return { ...prev, [filter]: updated };
    });
  };

  const handleToggleEditMode = () => {
    setIsEditMode(prev => !prev);
    setNewlyAddedQuestId(null);
  };

  const handleAddFilter = (name) => {
    const newId = `cus_${Date.now()}`;
    setFilterDefs(prev => [...prev, { id: newId, name, type: 'custom', visible: true }]);
  };

  const handleRenameFilter = (filterId, newName) => {
    setFilterDefs(prev => prev.map(f => f.id === filterId ? { ...f, name: newName } : f));
  };

  const handleToggleFilterVisibility = (filterId) => {
    const current = filterDefs.find(f => f.id === filterId);
    const isCurrentlyVisible = current?.visible !== false;
    setFilterDefs(prev => prev.map(f => f.id === filterId ? { ...f, visible: !isCurrentlyVisible } : f));
    if (isCurrentlyVisible && filter === filterId) {
      const fallback = filterDefs.find(f => f.id !== filterId && f.visible !== false);
      setFilter(fallback ? fallback.id : 'regular');
    }
  };

  const handleDeleteFilter = (filterId) => {
    setFilterDefs(prev => prev.filter(f => f.id !== filterId));
    setCustomFilterSets(prev => {
      const next = { ...prev };
      delete next[filterId];
      return next;
    });
    if (filter === filterId) {
      const fallback = filterDefs.find(f => f.id !== filterId && f.visible !== false);
      setFilter(fallback?.id || 'regular');
    }
  };

  const handleUpdateQuest = (questId, updatedData) => {
    setCustomQuestData(prev => ({
      ...prev,
      [questId]: updatedData
    }));
  };

  const handleDeleteQuest = (questId) => {
    if (questId.startsWith('custom_')) {
      setCustomQuestData(prev => {
        const newData = { ...prev };
        delete newData[questId];
        return newData;
      });
    } else {
      setCustomQuestData(prev => ({
        ...prev,
        [questId]: { ...(prev[questId] || {}), hidden: true }
      }));
    }

    setCompleted(prev => prev.filter(id => id !== questId));

    setCustomFilterSets(prev => {
      const newSets = {};
      Object.entries(prev).forEach(([filterId, set]) => {
        const newSet = { ...set };
        delete newSet[questId];
        newSets[filterId] = newSet;
      });
      return newSets;
    });
  };

  const handleAddQuest = (actId, insertIndex) => {
    const newQuestId = `custom_${actId}_${Date.now()}`;

    const activeDef = filterDefs.find(f => f.id === filter);
    const isCustomType = activeDef?.type === 'custom';

    const filters = isCustomType
      ? { regular: false, semiStrict: false, uber: false }
      : {
          regular: filter === 'regular',
          semiStrict: filter === 'semiStrict',
          uber: filter === 'uber'
        };

    const newQuest = {
      id: newQuestId,
      name: '새 퀘스트',
      reward: '',
      note: '',
      filters
    };

    setCustomQuestData(prev => ({ ...prev, [newQuestId]: newQuest }));
    setNewlyAddedQuestId(newQuestId);

    if (isCustomType) {
      setCustomFilterSets(prev => ({
        ...prev,
        [filter]: { ...(prev[filter] || {}), [newQuestId]: true }
      }));
    }

    if (insertIndex !== undefined) {
      const currentAct = filteredActs.find(a => a.id === actId);
      const currentIds = currentAct ? currentAct.quests.map(q => q.id) : [];
      const newOrder = [...currentIds];
      newOrder.splice(insertIndex, 0, newQuestId);
      setQuestOrder(prev => ({ ...prev, [actId]: newOrder }));
    }
  };

  const handleReorderQuests = (actId, newQuests) => {
    setQuestOrder(prev => ({
      ...prev,
      [actId]: newQuests.map(q => q.id)
    }));
  };

  const handleMergeSharedSettings = () => {
    if (!sharedSettings) return;

    const sharedCustomDefs = (sharedSettings.filterDefs || DEFAULT_FILTER_DEFS).filter(f => f.type === 'custom');
    const idRemap = {};
    const newFilterDefs = [...filterDefs];

    sharedCustomDefs.forEach(def => {
      const existingById = newFilterDefs.find(d => d.id === def.id);
      if (!existingById) {
        newFilterDefs.push({ ...def, visible: true });
        idRemap[def.id] = def.id;
      } else if (existingById.name === def.name) {
        idRemap[def.id] = def.id;
      } else {
        const newId = `cus_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        newFilterDefs.push({ ...def, id: newId, visible: true });
        idRemap[def.id] = newId;
      }
    });

    const newCustomFilterSets = { ...customFilterSets };
    sharedCustomDefs.forEach(def => {
      const targetId = idRemap[def.id];
      if (!targetId) return;
      const sharedSet = (sharedSettings.customFilterSets || {})[def.id] || {};
      newCustomFilterSets[targetId] = { ...(newCustomFilterSets[targetId] || {}), ...sharedSet };
    });

    const newCustomQuestData = { ...customQuestData, ...(sharedSettings.customQuestData || {}) };

    const newQuestOrder = { ...questOrder };
    Object.entries(sharedSettings.questOrder || {}).forEach(([actId, ids]) => {
      if (!newQuestOrder[actId]) {
        newQuestOrder[actId] = ids;
      } else {
        const newIds = ids.filter(id => !newQuestOrder[actId].includes(id));
        if (newIds.length > 0) {
          newQuestOrder[actId] = [...newQuestOrder[actId], ...newIds];
        }
      }
    });

    setFilterDefs(newFilterDefs);
    setCustomFilterSets(newCustomFilterSets);
    setCustomQuestData(newCustomQuestData);
    setQuestOrder(newQuestOrder);
    setSharedSettings(null);
    window.history.replaceState(null, '', window.location.pathname);
  };

  const handleCancelSharedSettings = () => {
    setSharedSettings(null);
    window.history.replaceState(null, '', window.location.pathname);
  };

  const handleTogglePip = async () => {
    try {
      setPipError(null);

      if (isPipWindowOpen()) {
        closePipWindow();
        setPipWindow(null);
      } else {
        const newPipWindow = await openPipWindow(450, 380);
        setPipWindow(newPipWindow);
        newPipWindow.addEventListener('pagehide', () => {
          setPipWindow(null);
        });
      }
    } catch (err) {
      console.error('PIP 토글 실패:', err);
      setPipError(err.message);
      setTimeout(() => setPipError(null), 5000);
    }
  };

  const getMergedQuestsData = () => {
    if (!questsData) return null;

    const builtInActIds = new Set(questsData.acts.map(a => a.id));
    const extraActs = customActs
      .filter(ca => !builtInActIds.has(ca.id))
      .map(ca => ({ id: ca.id, name: ca.name, quests: [] }));

    let baseActs = [...questsData.acts, ...extraActs];
    if (actOrder.length > 0) {
      const actMap = new Map(baseActs.map(a => [a.id, a]));
      const ordered = actOrder.filter(id => actMap.has(id)).map(id => actMap.get(id));
      const remaining = baseActs.filter(a => !actOrder.includes(a.id));
      baseActs = [...ordered, ...remaining];
    }

    return {
      ...questsData,
      acts: baseActs.map(act => {
        const displayName = actOverrides[act.id] ?? act.name;
        act = { ...act, name: displayName };
        const mergedQuests = act.quests
          .filter(quest => {
            const customData = customQuestData[quest.id];
            return !customData?.hidden;
          })
          .map(quest => {
            const customData = customQuestData[quest.id];
            if (customData) {
              return {
                ...quest,
                name: customData.name || quest.name,
                reward: customData.reward || quest.reward,
                note: customData.note || quest.note
              };
            }
            return quest;
          });

        const customAddedQuests = Object.entries(customQuestData)
          .filter(([id]) => id.startsWith(`custom_${act.id}_`))
          .filter(([, data]) => !data.hidden)
          .map(([id, data]) => ({
            id,
            name: data.name,
            waypoint: data.waypoint || '',
            reward: data.reward,
            note: data.note,
            filters: data.filters || { regular: true, semiStrict: false, uber: false }
          }));

        let allQuests = [...mergedQuests, ...customAddedQuests];

        if (questOrder[act.id]) {
          const orderedQuests = [];
          const questMap = new Map(allQuests.map(q => [q.id, q]));

          questOrder[act.id].forEach(id => {
            if (questMap.has(id)) {
              orderedQuests.push(questMap.get(id));
              questMap.delete(id);
            }
          });

          questMap.forEach(quest => orderedQuests.push(quest));
          allQuests = orderedQuests;
        }

        return { ...act, quests: allQuests };
      })
    };
  };

  const mergedQuestsData = getMergedQuestsData();
  const filteredActs = mergedQuestsData
    ? filterQuests(mergedQuestsData, filter, filterDefs, customFilterSets, isEditMode)
    : [];

  const activeDef = filterDefs.find(f => f.id === filter);
  const activeFilterIsCustom = activeDef?.type === 'custom';
  const activeFilterName = activeDef?.name || filter;
  const activeCustomFilterSet = customFilterSets[filter] || {};

  const totalQuests = filteredActs.reduce((sum, act) => sum + act.quests.length, 0);
  const completedQuests = filteredActs.reduce(
    (sum, act) => sum + act.quests.filter(q => completed.includes(q.id)).length,
    0
  );
  const overallProgress = totalQuests > 0 ? Math.round((completedQuests / totalQuests) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <>
      <div className="ambient-background" />

      <div className="min-h-screen py-6 px-4 relative">
        <div className="max-w-4xl mx-auto">
        <header className="mb-6 pb-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <Logo />
              <p className="text-xs sm:text-sm font-body mt-2" style={{ color: 'var(--text-secondary)' }}>
                by <span style={{ color: 'var(--gold-light)' }} className="font-medium">IamMove</span>
                {' • '}
                <a
                  href="https://github.com/Iam-Move/POE2QuestAlarm/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline transition-colors"
                  style={{ color: 'var(--accent-blue)' }}
                >
                  문의하기
                </a>
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => setIsDataModalOpen(true)}
                className="px-4 py-2 rounded-lg font-body font-semibold transition-all text-sm bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl hover:scale-105"
                title="CSV 내보내기 / 가져오기"
              >
                데이터
              </button>
              <button
                onClick={() => setIsGuideOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-all font-body flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
                title="사용 안내 보기"
              >
                <span className="text-lg">📖</span>
                <span>사용 안내</span>
              </button>
            </div>
          </div>
        </header>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-body" style={{ color: 'var(--text-secondary)' }}>전체 진행률</span>
            <span className="text-lg font-title font-semibold" style={{ color: 'var(--gold-primary)' }}>
              {completedQuests} / {totalQuests}
            </span>
          </div>
          <div className="progress-bar-container">
            <div
              className="progress-bar-fill"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <FilterBar
            filterDefs={filterDefs}
            activeFilter={filter}
            onFilterChange={handleFilterChange}
            isEditMode={isEditMode}
            onRenameFilter={handleRenameFilter}
            onToggleFilterVisibility={handleToggleFilterVisibility}
            onDeleteFilter={handleDeleteFilter}
            onAddFilter={handleAddFilter}
          />

          <div className="flex flex-wrap items-center gap-3">
            <EditModeToggle
              isEditMode={isEditMode}
              onToggle={handleToggleEditMode}
            />

            <button
              onClick={() => setIsResetModalOpen(true)}
              className="px-4 py-2 rounded-lg font-body font-semibold transition-all text-sm bg-gray-700/60 hover:bg-gray-700 text-gray-300 hover:text-white shadow hover:shadow-lg hover:scale-105"
              title="초기화 옵션"
            >
              초기화
            </button>

            <ShareButton
              filter={filter}
              completed={completed}
              filterDefs={filterDefs}
              customFilterSets={customFilterSets}
              customQuestData={customQuestData}
              questOrder={questOrder}
            />

            {isPipSupported() && (
              <button
                onClick={handleTogglePip}
                className={`px-4 py-2 rounded-lg font-body font-semibold transition-all text-sm flex items-center gap-1.5 ${
                  pipWindow
                    ? 'bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 shadow-lg'
                    : 'bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 shadow-[0_0_14px_3px_rgba(251,191,36,0.5)] animate-pulse'
                } text-white hover:shadow-xl hover:scale-105`}
                title="게임 오버레이 모드"
              >
                🖥️ 오버레이
              </button>
            )}
          </div>
        </div>

        {pipError && (
          <div className="mb-4 bg-red-600 text-white text-sm px-4 py-2 rounded">
            {pipError}
          </div>
        )}

        {filteredActs.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {filteredActs.map(act => (
              <button
                key={act.id}
                onClick={() => document.getElementById(act.id)?.scrollIntoView({ behavior: 'smooth' })}
                className="px-3 py-1 text-xs rounded-full bg-black/40 text-gray-400 hover:text-yellow-400 hover:bg-black/60 transition-all font-body"
              >
                {act.name}
              </button>
            ))}
          </div>
        )}

        <div
          className="sticky top-0 z-40 mb-4 rounded-lg"
          style={{
            background: 'rgba(10, 10, 15, 0.92)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--border-glow)',
          }}
        >
          <div className="px-4 py-2.5 flex items-center justify-between gap-4">
            <span className="text-xs font-body whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
              ⏱ 플레이 타임
            </span>
            <Timer
              timerSeconds={timerSeconds}
              timerRunning={timerRunning}
              timerStartedAt={timerStartedAt}
              onStart={handleTimerStart}
              onStop={handleTimerStop}
              onReset={handleTimerReset}
              onEdit={handleTimerEdit}
            />
          </div>
        </div>

        <main>
          {filteredActs.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              선택한 필터에 해당하는 퀘스트가 없습니다.
            </div>
          ) : (
            filteredActs.map(act => (
              <ActGroup
                key={act.id}
                act={act}
                completed={completed}
                onToggle={handleToggleQuest}
                isEditMode={isEditMode}
                currentFilterIsCustom={activeFilterIsCustom}
                currentFilterName={activeFilterName}
                customFilterSet={activeCustomFilterSet}
                onToggleFilterMembership={handleToggleFilterMembership}
                onBulkSetFilterMembership={handleBulkSetFilterMembership}
                isCustomAct={customActs.some(ca => ca.id === act.id)}
                onRenameAct={handleRenameAct}
                onDeleteAct={handleDeleteAct}
                onMoveAct={handleMoveAct}
                onUpdateQuest={handleUpdateQuest}
                onDeleteQuest={handleDeleteQuest}
                onAddQuest={handleAddQuest}
                onReorderQuests={handleReorderQuests}
                newlyAddedQuestId={newlyAddedQuestId}
              />
            ))
          )}
        </main>

        {pipWindow && (
          <PIPOverlay
            pipWindow={pipWindow}
            acts={filteredActs}
            completed={completed}
            onToggle={handleToggleQuest}
            currentFilter={filter}
            onUndo={handleUndo}
            canUndo={undoStack.length > 0}
            timerSeconds={timerSeconds}
            timerRunning={timerRunning}
            timerStartedAt={timerStartedAt}
            onTimerStart={handleTimerStart}
            onTimerStop={handleTimerStop}
            onTimerReset={handleTimerReset}
            onTimerEdit={handleTimerEdit}
            activeFilterName={activeFilterName}
            allActs={mergedQuestsData?.acts || []}
            onProgressReset={handleProgressReset}
          />
        )}

        {sharedSettings && (
          <SharedSettingsAlert
            title={sharedSettings.title}
            description={sharedSettings.description}
            onMerge={handleMergeSharedSettings}
            onCancel={handleCancelSharedSettings}
          />
        )}

        <DataModal
          isOpen={isDataModalOpen}
          onClose={() => setIsDataModalOpen(false)}
          actsData={mergedQuestsData}
          completed={completed}
          filterDefs={filterDefs}
          customFilterSets={customFilterSets}
          activeFilter={filter}
          onImport={handleCsvImport}
        />

        <GuideModal
          isOpen={isGuideOpen}
          onClose={() => setIsGuideOpen(false)}
        />

        <ResetModal
          isOpen={isResetModalOpen}
          onClose={() => setIsResetModalOpen(false)}
          acts={mergedQuestsData?.acts || []}
          onFullReset={handleFullReset}
          onProgressReset={handleProgressReset}
        />
        </div>
      </div>

      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-black/70 border border-yellow-400/30 text-yellow-400/70 hover:text-yellow-400 hover:border-yellow-400/60 hover:bg-black/90 transition-all shadow-lg backdrop-blur-sm"
          aria-label="맨 위로"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}
    </>
  );
}

export default App;
