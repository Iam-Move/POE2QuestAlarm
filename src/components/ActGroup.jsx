import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import QuestCard from './QuestCard';

// Act별 배경색 매핑
const ACT_COLORS = {
  'act1': 'bg-poe-act1',
  'act2': 'bg-poe-act2',
  'act3': 'bg-poe-act3',
  'act4': 'bg-poe-act4',
  'default': 'bg-poe-actExtra'
};

// 드래그 가능한 퀘스트 카드 래퍼
function SortableQuestCard({ quest, isEditMode, ...props }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: quest.id, disabled: !isEditMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 150ms ease',
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      {isEditMode && (
        <div
          {...attributes}
          {...listeners}
          className="absolute left-0 top-0 h-full flex items-center cursor-grab active:cursor-grabbing z-10 px-2 hover:bg-yellow-500/10"
        >
          <svg
            className="w-5 h-5 text-gray-400 hover:text-yellow-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8h16M4 16h16"
            />
          </svg>
        </div>
      )}
      <div className={isEditMode ? 'ml-8' : ''}>
        <QuestCard quest={quest} isEditMode={isEditMode} {...props} />
      </div>
    </div>
  );
}

function ActGroup({
  act,
  completed,
  onToggle,
  isEditMode,
  currentFilter,
  customFilters,
  onToggleCustom,
  onUpdateQuest,
  onDeleteQuest,
  onAddQuest,
  onReorderQuests
}) {
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Act ID에 따라 배경색 결정
  const bgColor = ACT_COLORS[act.id] || ACT_COLORS.default;

  const handleAddQuest = () => {
    onAddQuest(act.id);
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = act.quests.findIndex((q) => q.id === active.id);
      const newIndex = act.quests.findIndex((q) => q.id === over.id);

      const newQuests = arrayMove(act.quests, oldIndex, newIndex);
      onReorderQuests(act.id, newQuests);
    }

    setActiveId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const activeQuest = activeId ? act.quests.find((q) => q.id === activeId) : null;

  return (
    <div className={`mb-8 glass-card rounded-lg p-6 ${bgColor}`}>
      <h2 className="text-2xl font-title font-semibold mb-4 pb-3 border-b"
          style={{
            color: 'var(--gold-primary)',
            borderColor: 'var(--border-glow)'
          }}>
        {act.name}
      </h2>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext
          items={act.quests.map((q) => q.id)}
          strategy={verticalListSortingStrategy}
        >
          <div>
            {act.quests.map((quest) => (
              <SortableQuestCard
                key={quest.id}
                quest={quest}
                isCompleted={completed.includes(quest.id)}
                onToggle={onToggle}
                isEditMode={isEditMode}
                currentFilter={currentFilter}
                isCustomEnabled={customFilters[quest.id] === true}
                onToggleCustom={onToggleCustom}
                onUpdateQuest={onUpdateQuest}
                onDeleteQuest={onDeleteQuest}
              />
            ))}
          </div>
        </SortableContext>

        {/* DragOverlay 제거 - 원본 카드만 표시 */}
      </DndContext>

      {/* 편집 모드에서만 추가 버튼 표시 */}
      {isEditMode && (
        <button
          onClick={handleAddQuest}
          className="w-full mt-4 px-4 py-3 bg-green-600/20 hover:bg-green-600/40 text-green-400 rounded border border-green-600/30 transition-colors flex items-center justify-center gap-2"
        >
          <span className="text-xl">+</span>
          <span>새 퀘스트 추가</span>
        </button>
      )}
    </div>
  );
}

export default ActGroup;
