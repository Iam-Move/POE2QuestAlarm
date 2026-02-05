import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * PIP 오버레이 전용 UI
 * 완료되지 않은 퀘스트만 간단하게 표시
 */
function PIPOverlay({ pipWindow, acts, completed, onToggle, currentFilter }) {
  const containerRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [completingQuests, setCompletingQuests] = useState(new Set()); // 완료 중인 퀘스트
  const [fadingQuests, setFadingQuests] = useState(new Set()); // 페이드아웃 중인 퀘스트
  const prevCompletedRef = useRef([]); // 이전 completed 상태 저장

  // 완료된 퀘스트 애니메이션 처리
  useEffect(() => {
    const prevCompleted = prevCompletedRef.current;
    const newCompleted = completed.filter(id => !prevCompleted.includes(id));

    // 현재 completed를 저장
    prevCompletedRef.current = completed;

    if (newCompleted.length > 0) {
      // 새로 완료된 퀘스트를 completing 상태로 설정
      setCompletingQuests(prev => new Set([...prev, ...newCompleted]));

      // 1초 후 페이드아웃 시작
      setTimeout(() => {
        setFadingQuests(prev => new Set([...prev, ...newCompleted]));

        // 추가 1초 후 완전히 제거
        setTimeout(() => {
          setCompletingQuests(prev => {
            const next = new Set(prev);
            newCompleted.forEach(id => next.delete(id));
            return next;
          });
          setFadingQuests(prev => {
            const next = new Set(prev);
            newCompleted.forEach(id => next.delete(id));
            return next;
          });
        }, 1000);
      }, 1000);
    }
  }, [completed]);

  useEffect(() => {
    if (!pipWindow || !pipWindow.document) return;

    // PIP 창 스타일 설정
    const pipDoc = pipWindow.document;

    // 기본 스타일 추가
    pipDoc.body.style.margin = '0';
    pipDoc.body.style.padding = '0';
    pipDoc.body.style.backgroundColor = '#1a1a1a';
    pipDoc.body.style.color = '#ffffff';
    pipDoc.body.style.fontFamily = 'Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif';
    pipDoc.body.style.overflow = 'auto';

    // Pretendard 폰트 CDN 직접 추가
    const fontLink = pipDoc.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.as = 'style';
    fontLink.crossOrigin = 'anonymous';
    fontLink.href = 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css';
    pipDoc.head.appendChild(fontLink);

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

  // 완료되지 않은 퀘스트 + 완료 중인 퀘스트(애니메이션 표시용)만 필터링
  const uncompletedActs = acts
    .map(act => ({
      ...act,
      quests: act.quests.filter(q =>
        !completed.includes(q.id) || completingQuests.has(q.id)
      )
    }))
    .filter(act => act.quests.length > 0);

  return createPortal(
    <div className="p-4 text-white" style={{ fontSize: '14px' }}>
      <div className="mb-4 border-b border-yellow-500 pb-2">
        <h2 className="text-lg font-bold text-yellow-500">POE2 퀘스트</h2>
        <p className="text-xs text-gray-400">남은 퀘스트만 표시</p>
      </div>

      {uncompletedActs.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          모든 퀘스트 완료! 🎉
        </div>
      ) : (
        uncompletedActs.map(act => (
          <div key={act.id} className="mb-6">
            <h3 className="text-sm font-bold text-yellow-400 mb-2 border-l-2 border-yellow-400 pl-2">
              {act.name}
            </h3>

            <div className="space-y-1">
              {act.quests.map(quest => {
                const isCompleting = completingQuests.has(quest.id);
                const isFading = fadingQuests.has(quest.id);

                return (
                  <div
                    key={quest.id}
                    className="flex items-start gap-2 p-2 hover:bg-gray-800 rounded cursor-pointer"
                    style={{
                      opacity: isFading ? 0 : 1,
                      transition: 'opacity 1s ease-out',
                    }}
                    onClick={() => onToggle(quest.id)}
                  >
                    <input
                      type="checkbox"
                      checked={isCompleting}
                      onChange={() => onToggle(quest.id)}
                      className="mt-0.5 flex-shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1 text-xs">
                      <div
                        className="font-medium"
                        style={{
                          textDecoration: isCompleting ? 'line-through' : 'none',
                          opacity: isCompleting ? 0.6 : 1,
                          transition: 'all 0.3s ease-out',
                        }}
                      >
                        {quest.name}
                      </div>
                      {quest.reward && (
                        <div
                          className="text-yellow-400 text-[10px]"
                          style={{
                            textDecoration: isCompleting ? 'line-through' : 'none',
                            opacity: isCompleting ? 0.6 : 1,
                            transition: 'all 0.3s ease-out',
                          }}
                        >
                          {quest.reward}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>,
    containerRef.current
  );
}

export default PIPOverlay;
