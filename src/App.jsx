import { useState, useEffect } from 'react';
import FilterBar from './components/FilterBar';
import ActGroup from './components/ActGroup';
import ShareButton from './components/ShareButton';
import EditModeToggle from './components/EditModeToggle';
import SharedSettingsAlert from './components/SharedSettingsAlert';
import PIPOverlay from './components/PIPOverlay';
import GuideModal from './components/GuideModal';
import Logo from './components/Logo';
import { filterQuests, FILTER_MODES } from './utils/filters';
import { saveState, loadState, clearState, exportState, importState } from './utils/storage';
import { decodeStateFromUrl } from './utils/share';
import { openPipWindow, closePipWindow, isPipSupported, isPipWindowOpen, getPipWindow } from './utils/pip';

function App() {
  const [questsData, setQuestsData] = useState(null);
  const [filter, setFilter] = useState(FILTER_MODES.REGULAR);
  const [completed, setCompleted] = useState([]);
  const [customFilters, setCustomFilters] = useState({});
  const [customQuestData, setCustomQuestData] = useState({});
  const [questOrder, setQuestOrder] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pipWindow, setPipWindow] = useState(null);
  const [pipError, setPipError] = useState(null);
  const [sharedSettings, setSharedSettings] = useState(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // 초기 데이터 로드
  useEffect(() => {
    // URL 해시에서 공유된 상태 확인
    const sharedState = decodeStateFromUrl(window.location.hash);

    if (sharedState) {
      // 공유된 설정이 있으면 알림 표시
      setSharedSettings(sharedState);
    } else {
      // localStorage에서 상태 복원
      const savedState = loadState();
      if (savedState) {
        setFilter(savedState.filter);
        setCompleted(savedState.completed);
        setCustomFilters(savedState.customFilters || {});
        setCustomQuestData(savedState.customQuestData || {});
        setQuestOrder(savedState.questOrder || {});
      }
    }

    // quests.json 로드
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

  // 상태 변경 시 저장
  useEffect(() => {
    if (!loading) {
      saveState({ filter, completed, customFilters, customQuestData, questOrder });
    }
  }, [filter, completed, customFilters, customQuestData, questOrder, loading]);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const handleToggleQuest = (questId) => {
    setCompleted(prev => {
      if (prev.includes(questId)) {
        return prev.filter(id => id !== questId);
      } else {
        return [...prev, questId];
      }
    });
  };

  const handleReset = () => {
    if (window.confirm('모든 진행 상황을 초기화하시겠습니까?')) {
      setCompleted([]);
      setCustomFilters({});
      clearState();
    }
  };

  const handleExport = () => {
    exportState({ filter, completed, customFilters, customQuestData, questOrder });
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    importState(file)
      .then(state => {
        setFilter(state.filter);
        setCompleted(state.completed);
        setCustomFilters(state.customFilters);
        setCustomQuestData(state.customQuestData);
        setQuestOrder(state.questOrder);
      })
      .catch(err => alert(err.message))
      .finally(() => { e.target.value = ''; });
  };

  const handleToggleCustomFilter = (questId) => {
    setCustomFilters(prev => ({
      ...prev,
      [questId]: !prev[questId]
    }));
  };

  const handleToggleEditMode = () => {
    setIsEditMode(prev => !prev);
  };

  const handleUpdateQuest = (questId, updatedData) => {
    setCustomQuestData(prev => ({
      ...prev,
      [questId]: updatedData
    }));
  };

  const handleDeleteQuest = (questId) => {
    if (questId.startsWith('custom_')) {
      // 커스텀 퀘스트: customQuestData에서 완전히 제거
      setCustomQuestData(prev => {
        const newData = { ...prev };
        delete newData[questId];
        return newData;
      });
    } else {
      // 기본 퀘스트: hidden으로 마킹
      setCustomQuestData(prev => ({
        ...prev,
        [questId]: {
          ...prev[questId],
          hidden: true
        }
      }));
    }

    // 완료 목록에서도 제거
    setCompleted(prev => prev.filter(id => id !== questId));
    // customFilters에서도 제거
    setCustomFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[questId];
      return newFilters;
    });
  };

  const handleAddQuest = (actId) => {
    // 새 퀘스트 ID 생성 (타임스탬프 기반)
    const newQuestId = `custom_${actId}_${Date.now()}`;

    // 현재 필터에 맞게 filters 설정
    const filters = {
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

    // customQuestData에 추가
    setCustomQuestData(prev => ({
      ...prev,
      [newQuestId]: newQuest
    }));

    // Custom 필터면 자동으로 활성화
    if (filter === 'custom') {
      setCustomFilters(prev => ({
        ...prev,
        [newQuestId]: true
      }));
    }
  };

  const handleReorderQuests = (actId, newQuests) => {
    // 퀘스트 ID 순서만 저장
    const questIds = newQuests.map(q => q.id);
    setQuestOrder(prev => ({
      ...prev,
      [actId]: questIds
    }));
  };

  const handleAcceptSharedSettings = () => {
    if (sharedSettings) {
      setFilter(sharedSettings.filter);
      setCustomFilters(sharedSettings.customFilters || {});
      setCustomQuestData(sharedSettings.customQuestData || {});
      setQuestOrder(sharedSettings.questOrder || {});
      setSharedSettings(null);
      // URL 해시 제거
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  const handleCancelSharedSettings = () => {
    setSharedSettings(null);
    // URL 해시 제거
    window.history.replaceState(null, '', window.location.pathname);
  };

  const handleTogglePip = async () => {
    try {
      setPipError(null);

      if (isPipWindowOpen()) {
        // PIP 닫기
        closePipWindow();
        setPipWindow(null);
      } else {
        // PIP 열기
        const newPipWindow = await openPipWindow(450, 380);
        setPipWindow(newPipWindow);

        // PIP 창이 닫힐 때 상태 업데이트
        newPipWindow.addEventListener('pagehide', () => {
          setPipWindow(null);
        });
      }
    } catch (error) {
      console.error('PIP 토글 실패:', error);
      setPipError(error.message);
      setTimeout(() => setPipError(null), 5000);
    }
  };

  // 퀘스트 데이터와 커스텀 데이터 병합
  const getMergedQuestsData = () => {
    if (!questsData) return null;

    return {
      ...questsData,
      acts: questsData.acts.map(act => {
        // 기존 퀘스트 병합 (hidden 제외)
        const mergedQuests = act.quests
          .filter(quest => {
            const customData = customQuestData[quest.id];
            return !customData?.hidden; // hidden이 true면 제외
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

        // 커스텀 추가된 퀘스트 찾기
        const customAddedQuests = Object.entries(customQuestData)
          .filter(([id, data]) => id.startsWith(`custom_${act.id}_`))
          .map(([id, data]) => ({
            id,
            name: data.name,
            reward: data.reward,
            note: data.note,
            filters: data.filters || { regular: false, semiStrict: false, uber: false }
          }));

        let allQuests = [...mergedQuests, ...customAddedQuests];

        // 저장된 순서가 있으면 적용
        if (questOrder[act.id]) {
          const orderedQuests = [];
          const questMap = new Map(allQuests.map(q => [q.id, q]));

          // 저장된 순서대로 배치
          questOrder[act.id].forEach(id => {
            if (questMap.has(id)) {
              orderedQuests.push(questMap.get(id));
              questMap.delete(id);
            }
          });

          // 순서에 없는 새로운 퀘스트는 뒤에 추가
          questMap.forEach(quest => orderedQuests.push(quest));

          allQuests = orderedQuests;
        }

        return {
          ...act,
          quests: allQuests
        };
      })
    };
  };

  // 필터링된 퀘스트 계산
  const mergedQuestsData = getMergedQuestsData();
  const filteredActs = mergedQuestsData ? filterQuests(mergedQuestsData, filter, customFilters, isEditMode) : [];

  // 전체 진행률 계산
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
      {/* Ambient Background */}
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
                onClick={handleExport}
                className="px-4 py-2 rounded-lg font-body font-semibold transition-all text-sm bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl hover:scale-105"
                title="현재 진행 상황을 파일로 저장"
              >
                백업
              </button>
              <label
                className="px-4 py-2 rounded-lg font-body font-semibold transition-all text-sm bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl hover:scale-105 cursor-pointer"
                title="백업 파일에서 진행 상황 복원"
              >
                복원
                <input type="file" accept=".json" className="hidden" onChange={handleImport} />
              </label>
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

        {/* Progress Bar */}
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
          <FilterBar currentFilter={filter} onFilterChange={handleFilterChange} />

          <div className="flex flex-wrap items-center gap-3">
            <EditModeToggle
              isEditMode={isEditMode}
              onToggle={handleToggleEditMode}
            />

            {isPipSupported() && (
              <button
                onClick={handleTogglePip}
                className={`px-4 py-2 rounded-lg font-body font-semibold transition-all text-sm ${
                  pipWindow
                    ? 'bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800'
                    : 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700'
                } text-white shadow-lg hover:shadow-xl hover:scale-105`}
                title="게임 오버레이 모드"
              >
                오버레이
              </button>
            )}

            <ShareButton filter={filter} completed={completed} customFilters={customFilters} customQuestData={customQuestData} questOrder={questOrder} />
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-lg font-body font-semibold transition-all text-sm bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl hover:scale-105"
            >
              초기화
            </button>
          </div>
        </div>

        {pipError && (
          <div className="mb-4 bg-red-600 text-white text-sm px-4 py-2 rounded">
            {pipError}
          </div>
        )}

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
                currentFilter={filter}
                customFilters={customFilters}
                onToggleCustom={handleToggleCustomFilter}
                onUpdateQuest={handleUpdateQuest}
                onDeleteQuest={handleDeleteQuest}
                onAddQuest={handleAddQuest}
                onReorderQuests={handleReorderQuests}
              />
            ))
          )}
        </main>

        {/* PIP 오버레이 */}
        {pipWindow && (
          <PIPOverlay
            pipWindow={pipWindow}
            acts={filteredActs}
            completed={completed}
            onToggle={handleToggleQuest}
            currentFilter={filter}
          />
        )}

        {/* 공유된 설정 알림 */}
        {sharedSettings && (
          <SharedSettingsAlert
            title={sharedSettings.title}
            description={sharedSettings.description}
            onAccept={handleAcceptSharedSettings}
            onCancel={handleCancelSharedSettings}
          />
        )}

        {/* 사용 안내 모달 */}
        <GuideModal
          isOpen={isGuideOpen}
          onClose={() => setIsGuideOpen(false)}
        />
        </div>
      </div>
    </>
  );
}

export default App;
