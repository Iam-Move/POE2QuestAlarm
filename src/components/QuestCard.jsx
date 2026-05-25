import { useState } from 'react';

function parseRewardType(reward) {
  if (!reward) return null;

  const lowerReward = reward.toLowerCase();

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
  currentFilterIsCustom,
  currentFilterName,
  isCustomEnabled,
  onToggleFilterMembership,
  onUpdateQuest,
  onDeleteQuest,
  isNew
}) {
  const [editedName, setEditedName] = useState(quest.name);
  const [editedReward, setEditedReward] = useState(quest.reward || '');
  const [editedNote, setEditedNote] = useState(quest.note || '');

  const handleSave = () => {
    onUpdateQuest(quest.id, {
      ...quest,
      name: editedName,
      reward: editedReward,
      note: editedNote
    });
  };

  const handleBlur = () => {
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
        <div>
          {currentFilterIsCustom && (
            <label className="flex items-center gap-2 text-xs text-orange-400 cursor-pointer mb-2">
              <input
                type="checkbox"
                checked={isCustomEnabled}
                onChange={() => onToggleFilterMembership(quest.id)}
                className="w-3.5 h-3.5"
              />
              <span className="font-medium">{currentFilterName} 반영</span>
            </label>
          )}

          <input
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            onBlur={handleBlur}
            onFocus={(e) => isNew && e.target.select()}
            autoFocus={isNew}
            className="w-full text-base font-medium bg-transparent border-0 border-b border-transparent hover:border-gray-600 focus:border-yellow-500 focus:outline-none transition-colors px-0 py-1 mb-2"
            placeholder="퀘스트 이름을 입력하세요"
          />

          <div className="flex gap-3 mb-1">
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

            <div className="text-gray-600 text-sm">|</div>

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
