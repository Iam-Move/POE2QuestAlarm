import { useState } from 'react';

// 보상 타입을 파싱하는 함수
function parseRewardType(reward) {
  if (!reward) return null;

  const lowerReward = reward.toLowerCase();

  // 패시브 포인트 (금색)
  if (lowerReward.includes('패시브') ||
      lowerReward.includes('스킬 포인트') ||
      lowerReward.includes('skill point') ||
      lowerReward.includes('passive')) {
    return {
      type: 'passive',
      icon: '⚡',
      className: 'bg-gradient-to-r from-yellow-500 to-yellow-600'
    };
  }

  // 스탯 보너스 (파란색)
  if (lowerReward.includes('저항') ||
      lowerReward.includes('능력치') ||
      lowerReward.includes('스탯') ||
      lowerReward.includes('+') ||
      lowerReward.includes('%') ||
      lowerReward.includes('방어도') ||
      lowerReward.includes('회피') ||
      lowerReward.includes('보호막') ||
      lowerReward.includes('힘') ||
      lowerReward.includes('민첩') ||
      lowerReward.includes('지능')) {
    return {
      type: 'stat',
      icon: '🛡️',
      className: 'bg-gradient-to-r from-blue-500 to-blue-600'
    };
  }

  // 아이템/기타 (보라색)
  return {
    type: 'item',
    icon: '🏆',
    className: 'bg-gradient-to-r from-purple-500 to-purple-600'
  };
}

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
        quest-card glass-card mb-3 p-3 rounded-lg z-card
        ${isCompleted && !isEditMode ? 'completed' : ''}
        ${isEditMode ? 'border-orange-400/30' : ''}
      `}
    >
      {isEditMode ? (
        // 편집 모드: 인라인 편집 스타일
        <div>
          {/* Custom 필터일 때 반영여부 체크박스 */}
          {currentFilter === 'custom' && (
            <label className="flex items-center gap-2 text-xs text-orange-400 cursor-pointer mb-2">
              <input
                type="checkbox"
                checked={isCustomEnabled}
                onChange={() => onToggleCustom(quest.id)}
                className="w-3.5 h-3.5"
              />
              <span className="font-medium">Custom 반영</span>
            </label>
          )}

          {/* 퀘스트 이름 - 인라인 편집 */}
          <input
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            onBlur={handleBlur}
            className="w-full text-base font-medium bg-transparent border-0 border-b border-transparent hover:border-gray-600 focus:border-yellow-500 focus:outline-none transition-colors px-0 py-1 mb-2"
            placeholder="퀘스트 이름을 입력하세요"
          />

          {/* 보상과 메모 - 한 줄에 나란히 */}
          <div className="flex gap-3 mb-1">
            {/* 보상 입력 */}
            <div className="flex-1">
              <input
                type="text"
                value={editedReward}
                onChange={(e) => setEditedReward(e.target.value)}
                onBlur={handleBlur}
                className="w-full text-sm text-yellow-400 bg-transparent border-0 border-b border-transparent hover:border-gray-600 focus:border-yellow-500 focus:outline-none transition-colors px-0 py-1"
                placeholder="보상 (예: 패시브 포인트)"
              />
            </div>

            {/* 구분선 */}
            <div className="text-gray-600 text-sm">|</div>

            {/* 메모 입력 */}
            <div className="flex-1">
              <input
                type="text"
                value={editedNote}
                onChange={(e) => setEditedNote(e.target.value)}
                onBlur={handleBlur}
                className="w-full text-sm text-gray-400 bg-transparent border-0 border-b border-transparent hover:border-gray-600 focus:border-yellow-500 focus:outline-none transition-colors px-0 py-1"
                placeholder="메모 (예: 필수 퀘스트)"
              />
            </div>
          </div>

          {/* 삭제 버튼 - 작고 우측 하단 */}
          <div className="flex justify-end mt-1">
            <button
              onClick={handleDelete}
              className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
            >
              🗑️ 삭제
            </button>
          </div>
        </div>
      ) : (
        // 일반 모드: 체크박스와 읽기 전용 표시
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={isCompleted}
            onChange={() => onToggle(quest.id)}
            className="custom-checkbox mt-1"
          />
          <div className="flex-1">
            <h3 className="text-base font-medium mb-2">
              {quest.name}
            </h3>
            {quest.reward && (
              <div className="flex flex-wrap gap-2 mb-2">
                {quest.reward.split(',').map((reward, index) => {
                  const rewardData = parseRewardType(reward.trim());
                  if (!rewardData) return null;

                  return (
                    <span
                      key={index}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-white shadow-md ${rewardData.className}`}
                    >
                      <span>{rewardData.icon}</span>
                      <span>{reward.trim()}</span>
                    </span>
                  );
                })}
              </div>
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
