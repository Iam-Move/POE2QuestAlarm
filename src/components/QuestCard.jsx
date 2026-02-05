import { useState } from 'react';

function QuestCard({
  quest,
  isCompleted,
  onToggle,
  isEditMode,
  currentFilter,
  isCustomEnabled,
  onToggleCustom,
  onUpdateQuest,
  onDeleteQuest
}) {
  const [editedName, setEditedName] = useState(quest.name);
  const [editedReward, setEditedReward] = useState(quest.reward || '');
  const [editedNote, setEditedNote] = useState(quest.note || '');

  const handleSave = () => {
    onUpdateQuest(quest.id, {
      name: editedName,
      reward: editedReward,
      note: editedNote
    });
  };

  const handleBlur = () => {
    // 내용이 변경되었으면 자동 저장
    if (
      editedName !== quest.name ||
      editedReward !== (quest.reward || '') ||
      editedNote !== (quest.note || '')
    ) {
      handleSave();
    }
  };

  const handleDelete = () => {
    if (window.confirm(`"${quest.name}" 퀘스트를 삭제하시겠습니까?`)) {
      onDeleteQuest(quest.id);
    }
  };

  return (
    <div
      className={`
        quest-card mb-3 p-3 rounded border
        ${isCompleted && !isEditMode ? 'completed' : ''}
        ${isEditMode ? 'bg-poe-card/50 border-orange-400/30' : 'bg-poe-dark/20 border-poe-border/10'}
      `}
    >
      {isEditMode ? (
        // 편집 모드: 완료 체크박스 없이, 입력 필드와 삭제 버튼
        <div className="space-y-2">
          {/* Custom 필터일 때 반영여부 체크박스 */}
          {currentFilter === 'custom' && (
            <label className="flex items-center gap-2 text-sm text-orange-400 cursor-pointer mb-3">
              <input
                type="checkbox"
                checked={isCustomEnabled}
                onChange={() => onToggleCustom(quest.id)}
                className="w-4 h-4"
              />
              <span className="font-medium">✓ Custom 반영 (체크해야 편집모드 OFF 시 표시)</span>
            </label>
          )}

          {/* 퀘스트 이름 */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">퀘스트 이름</label>
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onBlur={handleBlur}
              className="w-full bg-poe-dark border border-poe-border rounded px-3 py-2 text-white font-medium focus:outline-none focus:border-yellow-500"
              placeholder="퀘스트 이름을 입력하세요"
            />
          </div>

          {/* 보상 */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">보상 (선택)</label>
            <input
              type="text"
              value={editedReward}
              onChange={(e) => setEditedReward(e.target.value)}
              onBlur={handleBlur}
              className="w-full bg-poe-dark border border-poe-border rounded px-3 py-2 text-yellow-400 text-sm focus:outline-none focus:border-yellow-500"
              placeholder="예: 스킬 젬, 냉기저항 +10%"
            />
          </div>

          {/* 메모 */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">메모 (선택)</label>
            <textarea
              value={editedNote}
              onChange={(e) => setEditedNote(e.target.value)}
              onBlur={handleBlur}
              rows={2}
              className="w-full bg-poe-dark border border-poe-border rounded px-3 py-2 text-gray-300 text-sm resize-none focus:outline-none focus:border-yellow-500"
              placeholder="팁이나 참고사항을 입력하세요"
            />
          </div>

          {/* 삭제 버튼 */}
          <button
            onClick={handleDelete}
            className="w-full mt-2 px-3 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 text-sm rounded transition-colors border border-red-600/30"
          >
            🗑️ 이 퀘스트 삭제
          </button>
        </div>
      ) : (
        // 일반 모드: 체크박스와 읽기 전용 표시
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={isCompleted}
            onChange={() => onToggle(quest.id)}
            className="mt-1 w-5 h-5 cursor-pointer flex-shrink-0"
          />
          <div className="flex-1">
            <h3 className="text-base font-medium mb-1">
              {quest.name}
            </h3>
            {quest.reward && (
              <p className="text-sm text-yellow-400 mb-1">
                [보상: {quest.reward}]
              </p>
            )}
            {quest.note && (
              <p className="text-sm text-gray-400 italic">
                ※ {quest.note}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default QuestCard;
