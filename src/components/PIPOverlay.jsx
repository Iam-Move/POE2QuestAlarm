import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Timer from './Timer';

/**
 * PIP 오버레이 전용 UI
 * 완료되지 않은 퀘스트만 간단하게 표시
 */
function PIPOverlay({
  pipWindow, acts, completed, onToggle, currentFilter,
  onUndo, canUndo,
  timerSeconds, timerRunning, timerStartedAt,
  onTimerStart, onTimerStop, onTimerReset, onTimerEdit,
  activeFilterName, onProgressReset,
  pipOpacity, onPipOpacityChange,
}) {
  const containerRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [fadingQuests, setFadingQuests] = useState(new Set()); // 페이드아웃 중인 퀘스트
  const prevCompletedRef = useRef([]); // 이전 completed 상태 저장
  const [confirmReset, setConfirmReset] = useState(false);

  // 완료된 퀘스트 애니메이션 처리 (단순화)
  useEffect(() => {
    const prevCompleted = prevCompletedRef.current;
    const newCompleted = completed.filter(id => !prevCompleted.includes(id));
    const newUncompleted = prevCompleted.filter(id => !completed.includes(id));

    // 완료 취소된 퀘스트 처리 (메인 페이지와 동기화)
    if (newUncompleted.length > 0) {
      setFadingQuests(prev => {
        const next = new Set(prev);
        newUncompleted.forEach(id => next.delete(id));
        return next;
      });
    }

    // 새로 완료된 퀘스트 처리
    if (newCompleted.length > 0) {
      newCompleted.forEach(questId => {
        // 즉시 페이드 상태로 추가 (취소선은 completed 상태로 자동 표시)
        setFadingQuests(prev => new Set([...prev, questId]));

        // 0.8초 후 페이드 상태에서 제거 (0.5초 opacity + 0.3초 height collapse)
        setTimeout(() => {
          setFadingQuests(prev => {
            const next = new Set(prev);
            next.delete(questId);
            return next;
          });
        }, 800);
      });
    }

    prevCompletedRef.current = completed;
  }, [completed]);

  useEffect(() => {
    if (!pipWindow || !pipWindow.document) return;

    // PIP 창 스타일 설정
    const pipDoc = pipWindow.document;

    // 기본 스타일 추가
    pipDoc.body.style.margin = '0';
    pipDoc.body.style.padding = '0';
    pipDoc.body.style.backgroundColor = 'transparent';
    pipDoc.body.style.color = 'var(--text-primary, #e8e6e3)';
    pipDoc.body.style.fontFamily = "'Noto Sans KR', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif";
    pipDoc.body.style.overflow = 'hidden'; // 스크롤바 1개만 (컨테이너에서만)

    // CSS 변수 주입 및 커스텀 스크롤바 스타일
    const cssVars = pipDoc.createElement('style');
    cssVars.textContent = `
      :root {
        --bg-primary: #0a0a0f;
        --bg-secondary: #12121a;
        --bg-card: rgba(20, 20, 35, 0.95);
        --gold-primary: #d4af37;
        --gold-light: #f4d03f;
        --text-primary: #e8e6e3;
        --text-secondary: #9a9a9a;
        --border-glow: rgba(212, 175, 55, 0.3);
      }

      /* 커스텀 스크롤바 스타일 */
      ::-webkit-scrollbar {
        width: 8px;
      }

      ::-webkit-scrollbar-track {
        background: rgba(20, 20, 35, 0.5);
        border-radius: 4px;
      }

      ::-webkit-scrollbar-thumb {
        background: rgba(212, 175, 55, 0.4);
        border-radius: 4px;
        transition: background 0.2s;
      }

      ::-webkit-scrollbar-thumb:hover {
        background: rgba(212, 175, 55, 0.6);
      }
    `;
    pipDoc.head.appendChild(cssVars);

    // Google Fonts 추가 (Noto Sans KR)
    const fontLink = pipDoc.createElement('link');
    fontLink.rel = 'preconnect';
    fontLink.href = 'https://fonts.googleapis.com';
    pipDoc.head.appendChild(fontLink);

    const fontLink2 = pipDoc.createElement('link');
    fontLink2.rel = 'preconnect';
    fontLink2.href = 'https://fonts.gstatic.com';
    fontLink2.crossOrigin = 'anonymous';
    pipDoc.head.appendChild(fontLink2);

    const fontLink3 = pipDoc.createElement('link');
    fontLink3.rel = 'stylesheet';
    fontLink3.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600&display=swap';
    pipDoc.head.appendChild(fontLink3);

    // 메인 창의 스타일시트 복사
    const styleSheets = Array.from(document.styleSheets);
    styleSheets.forEach(styleSheet => {
      try {
        const newStyle = pipDoc.createElement('style');
        const cssRules = Array.from(styleSheet.cssRules);
        const cssText = cssRules.map(rule => rule.cssText).join('\n');
        newStyle.textContent = cssText;
        pipDoc.head.appendChild(newStyle);
      } catch (e) {
        // CORS 에러 무시
        if (styleSheet.href) {
          const link = pipDoc.createElement('link');
          link.rel = 'stylesheet';
          link.href = styleSheet.href;
          pipDoc.head.appendChild(link);
        }
      }
    });

    // 컨테이너 생성
    const container = pipDoc.createElement('div');
    container.id = 'pip-root';
    pipDoc.body.appendChild(container);
    containerRef.current = container;

    // 준비 완료
    setIsReady(true);

    return () => {
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
      }
      setIsReady(false);
    };
  }, [pipWindow]);

  if (!isReady || !containerRef.current) return null;

  // 완료되지 않은 퀘스트 + 페이드 중인 퀘스트만 필터링
  const uncompletedActs = acts
    .map(act => ({
      ...act,
      quests: act.quests.filter(q =>
        !completed.includes(q.id) || fadingQuests.has(q.id)
      )
    }))
    .filter(act => act.quests.length > 0);

  return createPortal(
    <div className="p-4" style={{ fontSize: '16px', color: 'var(--text-primary)', background: `rgba(10, 10, 15, ${pipOpacity ?? 0.92})`, minHeight: '100vh' }}>
      <div className="mb-3 pb-3" style={{ borderBottom: '1px solid var(--border-glow)' }}>
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-xl font-bold" style={{ color: 'var(--gold-primary)', flexShrink: 0 }}>POE2 Quest</h2>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={pipOpacity ?? 0.92}
            onChange={e => onPipOpacityChange(Number(e.target.value))}
            style={{ flex: 1, accentColor: 'var(--gold-primary)', cursor: 'pointer', minWidth: 0 }}
          />
          <button
            onClick={onUndo}
            disabled={!canUndo}
            style={{
              fontSize: '0.75rem',
              padding: '2px 8px',
              borderRadius: '4px',
              background: canUndo ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${canUndo ? 'rgba(212,175,55,0.4)' : 'rgba(255,255,255,0.1)'}`,
              color: canUndo ? 'var(--gold-primary)' : 'rgba(255,255,255,0.2)',
              cursor: canUndo ? 'pointer' : 'default',
              transition: 'all 0.2s',
            }}
          >
            ↩ 되돌리기
          </button>
        </div>
        <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
          남은 퀘스트만 표시
          {activeFilterName && (
            <span style={{ marginLeft: '6px', color: 'var(--gold-primary)', fontWeight: 600 }}>
              [{activeFilterName}]
            </span>
          )}
        </p>
        <div style={{ borderTop: '1px solid rgba(212,175,55,0.15)', paddingTop: '8px' }}>
          <Timer
            timerSeconds={timerSeconds}
            timerRunning={timerRunning}
            timerStartedAt={timerStartedAt}
            onStart={onTimerStart}
            onStop={onTimerStop}
            onReset={onTimerReset}
            onEdit={onTimerEdit}
            compact
          />
          <div style={{ borderTop: '1px solid rgba(212,175,55,0.1)', paddingTop: '6px', marginTop: '6px' }}>
            {confirmReset ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>진행도 초기화할까요?</span>
                <button
                  onClick={() => { onProgressReset(); setConfirmReset(false); }}
                  style={{
                    padding: '1px 8px', borderRadius: '4px', fontSize: '0.72rem',
                    background: 'rgba(220,38,38,0.7)', color: '#fff', border: 'none', cursor: 'pointer',
                  }}
                >
                  예
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  style={{
                    padding: '1px 8px', borderRadius: '4px', fontSize: '0.72rem',
                    background: 'rgba(75,85,99,0.6)', color: '#d1d5db', border: 'none', cursor: 'pointer',
                  }}
                >
                  취소
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmReset(true)}
                style={{
                  padding: '2px 10px', borderRadius: '4px', fontSize: '0.72rem',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
                  color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220,38,38,0.15)'; e.currentTarget.style.borderColor = 'rgba(220,38,38,0.4)'; e.currentTarget.style.color = '#f87171'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                ↺ 진행도 초기화
              </button>
            )}
          </div>
        </div>
      </div>

      {uncompletedActs.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          모든 퀘스트 완료! 🎉
        </div>
      ) : (
        <div style={{
          maxHeight: 'calc(100vh - 220px)',
          overflowY: 'auto',
          paddingRight: '4px'
        }}>
          {uncompletedActs.map(act => (
            <div key={act.id} className="mb-6">
              <h3 className="text-sm font-bold mb-2 pl-2"
                  style={{
                    color: 'var(--gold-primary)',
                    borderLeft: '2px solid var(--gold-primary)'
                  }}>
                {act.name}
              </h3>

              <div className="space-y-1">
                {act.quests.map(quest => {
                  const isCompleted = completed.includes(quest.id);
                  const isFading = fadingQuests.has(quest.id);

                  return (
                    <div
                      key={quest.id}
                      className="flex items-start gap-2 p-2 rounded cursor-pointer"
                      style={{
                        opacity: isFading ? 0 : 1,
                        maxHeight: isFading ? 0 : '500px',
                        marginBottom: isFading ? 0 : '0.25rem',
                        paddingTop: isFading ? 0 : '0.5rem',
                        paddingBottom: isFading ? 0 : '0.5rem',
                        overflow: 'hidden',
                        transition: 'opacity 0.5s ease-out, max-height 0.3s ease-out 0.5s, margin 0.3s ease-out 0.5s, padding 0.3s ease-out 0.5s, background-color 0.2s',
                        backgroundColor: 'transparent',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      onClick={() => onToggle(quest.id)}
                    >
                      <input
                        type="checkbox"
                        checked={isCompleted}
                        onChange={() => onToggle(quest.id)}
                        className="mt-0.5 flex-shrink-0"
                        style={{ accentColor: 'var(--gold-primary)' }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1 text-sm">
                        {quest.waypoint && (
                          <div
                            className="text-xs mb-0.5"
                            style={{
                              opacity: isCompleted ? 0.6 : 1,
                              transition: 'all 0.2s ease-out',
                              color: 'var(--text-secondary)'
                            }}
                          >
                            📍 {quest.waypoint}
                          </div>
                        )}
                        <div
                          className="font-medium"
                          style={{
                            textDecoration: isCompleted ? 'line-through' : 'none',
                            opacity: isCompleted ? 0.6 : 1,
                            transition: 'all 0.2s ease-out',
                            color: 'var(--text-primary)'
                          }}
                        >
                          {quest.name}
                        </div>
                        {quest.reward && (
                          <div
                            className="text-xs"
                            style={{
                              textDecoration: isCompleted ? 'line-through' : 'none',
                              opacity: isCompleted ? 0.6 : 1,
                              transition: 'all 0.2s ease-out',
                              color: 'var(--gold-light)'
                            }}
                          >
                            {quest.reward}
                          </div>
                        )}
                        {quest.note && (
                          <div
                            className="text-xs mt-1"
                            style={{
                              textDecoration: isCompleted ? 'line-through' : 'none',
                              opacity: isCompleted ? 0.6 : 1,
                              transition: 'all 0.2s ease-out',
                              color: 'var(--text-secondary)',
                              fontStyle: 'italic'
                            }}
                          >
                            ※ {quest.note}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>,
    containerRef.current
  );
}

export default PIPOverlay;
