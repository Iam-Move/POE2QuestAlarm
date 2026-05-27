import { useState } from 'react';

function ResetModal({ isOpen, onClose, acts, onFullReset, onProgressReset }) {
  const [step, setStep] = useState('choose'); // 'choose' | 'full-confirm' | 'progress-select'
  const [selectedActs, setSelectedActs] = useState(new Set());

  if (!isOpen) return null;

  const handleClose = () => {
    setStep('choose');
    setSelectedActs(new Set());
    onClose();
  };

  const handleFullResetConfirm = () => {
    onFullReset();
    handleClose();
  };

  const handleProgressResetConfirm = () => {
    if (selectedActs.size === 0) return;
    const allSelected = acts.every(a => selectedActs.has(a.id));
    onProgressReset(allSelected ? null : [...selectedActs]);
    handleClose();
  };

  const toggleAct = (actId) => {
    setSelectedActs(prev => {
      const next = new Set(prev);
      if (next.has(actId)) next.delete(actId);
      else next.add(actId);
      return next;
    });
  };

  const selectAll = () => setSelectedActs(new Set(acts.map(a => a.id)));
  const clearAll = () => setSelectedActs(new Set());

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
      onClick={handleClose}
    >
      <div
        className="glass-card rounded-xl p-6 w-full max-w-sm"
        style={{ border: '1px solid var(--border-glow)', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        {step === 'choose' && (
          <>
            <h2 className="text-xl font-title font-bold mb-1" style={{ color: 'var(--gold-primary)' }}>
              초기화
            </h2>
            <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
              초기화할 항목을 선택하세요.
            </p>

            <div className="flex flex-col gap-3 mb-4">
              <button
                onClick={() => setStep('full-confirm')}
                className="w-full px-4 py-3 rounded-lg text-left border border-red-500/40 hover:border-red-500/70 bg-red-900/10 hover:bg-red-900/20 transition-all"
              >
                <div className="font-semibold text-red-400">⚠️ 전체 초기화</div>
                <div className="text-xs mt-0.5 text-gray-400">진행도, 필터 설정, 수정 내용, 타이머 기록 모두 삭제</div>
              </button>

              <button
                onClick={() => setStep('progress-select')}
                className="w-full px-4 py-3 rounded-lg text-left border hover:border-yellow-500/50 bg-yellow-900/10 hover:bg-yellow-900/20 transition-all"
                style={{ borderColor: 'var(--border-glow)' }}
              >
                <div className="font-semibold" style={{ color: 'var(--gold-primary)' }}>진행도 초기화</div>
                <div className="text-xs mt-0.5 text-gray-400">퀘스트 체크 해제만 — 필터/수정 내용은 유지</div>
              </button>
            </div>

            <button
              onClick={handleClose}
              className="w-full text-sm text-gray-500 hover:text-gray-300 transition-colors py-1"
            >
              취소
            </button>
          </>
        )}

        {step === 'full-confirm' && (
          <>
            <h2 className="text-xl font-title font-bold mb-2 text-red-400">⚠️ 전체 초기화</h2>
            <p className="text-sm mb-3" style={{ color: 'var(--text-primary)' }}>
              다음 항목이 <strong>모두 삭제</strong>됩니다. 되돌릴 수 없습니다.
            </p>

            <ul className="text-sm mb-5 space-y-1 pl-3" style={{ color: 'var(--text-secondary)' }}>
              <li>• 퀘스트 진행도 (체크 전부 해제)</li>
              <li>• 커스텀 필터 탭 및 설정</li>
              <li>• 커스텀 퀘스트 수정 내용</li>
              <li>• 퀘스트 순서 변경 내용</li>
              <li>• 타이머 기록</li>
            </ul>

            <div className="flex gap-2">
              <button
                onClick={handleFullResetConfirm}
                className="flex-1 px-3 py-2 bg-red-700 hover:bg-red-600 text-white rounded-lg font-semibold text-sm transition-all"
              >
                예, 모두 초기화
              </button>
              <button
                onClick={() => setStep('choose')}
                className="flex-1 px-3 py-2 bg-gray-700/60 hover:bg-gray-700 text-gray-200 rounded-lg text-sm transition-all"
              >
                취소
              </button>
            </div>
          </>
        )}

        {step === 'progress-select' && (
          <>
            <h2 className="text-xl font-title font-bold mb-1" style={{ color: 'var(--gold-primary)' }}>
              진행도 초기화
            </h2>
            <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
              초기화할 액트를 선택하세요.
            </p>

            <div className="flex gap-3 mb-3">
              <button onClick={selectAll} className="text-xs text-yellow-400 hover:text-yellow-300 underline transition-colors">
                전체 선택
              </button>
              <button onClick={clearAll} className="text-xs text-gray-500 hover:text-gray-300 underline transition-colors">
                선택 해제
              </button>
            </div>

            <div className="space-y-1 max-h-56 overflow-y-auto mb-4 pr-1">
              {acts.map(act => (
                <label
                  key={act.id}
                  className="flex items-center gap-3 cursor-pointer hover:bg-white/5 px-2 py-1.5 rounded transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedActs.has(act.id)}
                    onChange={() => toggleAct(act.id)}
                    style={{ accentColor: 'var(--gold-primary)' }}
                  />
                  <span
                    className="text-sm"
                    style={{ color: selectedActs.has(act.id) ? 'var(--gold-primary)' : 'var(--text-primary)' }}
                  >
                    {act.name}
                  </span>
                </label>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleProgressResetConfirm}
                disabled={selectedActs.size === 0}
                className="flex-1 px-3 py-2 bg-yellow-700 hover:bg-yellow-600 text-white rounded-lg font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                선택 초기화 ({selectedActs.size}개 액트)
              </button>
              <button
                onClick={() => setStep('choose')}
                className="flex-1 px-3 py-2 bg-gray-700/60 hover:bg-gray-700 text-gray-200 rounded-lg text-sm transition-all"
              >
                뒤로
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ResetModal;
