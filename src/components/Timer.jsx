import { useState, useEffect } from 'react';

function formatTime(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function parseTimeInput(input) {
  const parts = input.trim().split(':').map(p => parseInt(p, 10));
  if (parts.some(p => isNaN(p) || p < 0)) return null;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 1) return parts[0];
  return null;
}

function Timer({ timerSeconds, timerRunning, timerStartedAt, onStart, onStop, onReset, onEdit, compact = false }) {
  const [tick, setTick] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [confirm, setConfirm] = useState(null); // null | 'reset' | { type: 'edit', seconds }

  useEffect(() => {
    if (!timerRunning) return;
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [timerRunning]);

  const displaySeconds = timerRunning && timerStartedAt
    ? timerSeconds + Math.floor((Date.now() - timerStartedAt) / 1000)
    : timerSeconds;

  const handleTimeClick = () => {
    if (timerRunning || isEditing) return;
    setEditValue(formatTime(displaySeconds));
    setIsEditing(true);
    setConfirm(null);
  };

  const handleEditDone = () => {
    const parsed = parseTimeInput(editValue);
    setIsEditing(false);
    if (parsed !== null && parsed >= 0) {
      setConfirm({ type: 'edit', seconds: parsed });
    }
  };

  const handleConfirm = (yes) => {
    if (yes && confirm) {
      if (confirm === 'reset') onReset();
      else if (confirm.type === 'edit') onEdit(confirm.seconds);
    }
    setConfirm(null);
  };

  const timeDisplay = isEditing ? (
    <input
      autoFocus
      value={editValue}
      onChange={e => setEditValue(e.target.value)}
      onBlur={handleEditDone}
      onKeyDown={e => {
        if (e.key === 'Enter') handleEditDone();
        if (e.key === 'Escape') setIsEditing(false);
      }}
      className={`bg-black/50 border border-yellow-500/60 rounded text-center focus:outline-none focus:border-yellow-400 font-mono ${
        compact ? 'text-sm w-20 px-1 py-0.5' : 'text-2xl w-32 px-2 py-0.5'
      }`}
      style={{ color: 'var(--text-primary)' }}
    />
  ) : (
    <span
      onClick={handleTimeClick}
      className={`font-mono select-none transition-colors ${compact ? 'text-sm' : 'text-2xl font-semibold'} ${
        timerRunning
          ? 'text-yellow-300'
          : 'cursor-pointer hover:text-yellow-400'
      }`}
      style={{ color: timerRunning ? undefined : 'var(--text-primary)', letterSpacing: '0.05em' }}
      title={timerRunning ? undefined : '클릭하여 수정'}
    >
      {formatTime(displaySeconds)}
    </span>
  );

  return (
    <div className={`flex flex-col items-center ${compact ? 'gap-1' : 'gap-2'}`}>
      <div className={`flex items-center ${compact ? 'gap-1.5' : 'gap-3'}`}>
        {timeDisplay}

        <button
          onClick={timerRunning ? onStop : onStart}
          className={`font-body font-medium rounded transition-all ${
            compact ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'
          } ${
            timerRunning
              ? 'bg-yellow-700/70 hover:bg-yellow-700 text-yellow-100'
              : 'bg-green-700/70 hover:bg-green-700 text-green-100'
          }`}
        >
          {timerRunning ? '⏸ 정지' : '▶ 시작'}
        </button>

        <button
          onClick={() => { setConfirm('reset'); setIsEditing(false); }}
          className={`font-body font-medium rounded transition-all bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white ${
            compact ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'
          }`}
        >
          ↺ 리셋
        </button>
      </div>

      {confirm && (
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`${compact ? 'text-xs' : 'text-xs'}`} style={{ color: 'var(--text-secondary)' }}>
            {confirm === 'reset'
              ? '타이머를 초기화할까요?'
              : `${formatTime(confirm.seconds)}으로 변경할까요?`}
          </span>
          <button
            onClick={() => handleConfirm(true)}
            className="text-xs px-2 py-0.5 bg-red-700/80 hover:bg-red-700 text-white rounded transition-all"
          >
            예
          </button>
          <button
            onClick={() => handleConfirm(false)}
            className="text-xs px-2 py-0.5 bg-gray-700/80 hover:bg-gray-700 text-gray-300 rounded transition-all"
          >
            아니오
          </button>
        </div>
      )}
    </div>
  );
}

export default Timer;
