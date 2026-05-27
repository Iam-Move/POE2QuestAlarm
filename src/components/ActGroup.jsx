import { Fragment, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
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

const ACT_COLORS = {
  'act1': 'bg-poe-act1',
  'act2': 'bg-poe-act2',
  'act3': 'bg-poe-act3',
  'act4': 'bg-poe-act4',
  'default': 'bg-poe-actExtra'
};

function InsertDivider({ onInsert }) {
  return (
    <div
      className="flex items-center cursor-pointer group py-0.5 hover:py-1 transition-all"
      onClick={onInsert}
    >
      <div className="h-px flex-1 bg-gray-700/20 group-hover:bg-green-500/50 transition-colors" />
      <span className="mx-2 text-xs text-green-400 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 border border-green-600/30 rounded px-2 py-0.5 select-none whitespace-nowrap">
        + 여기에 추가
      </span>
      <div className="h-px flex-1 bg-gray-700/20 group-hover:bg-green-500/50 transition-colors" />
    </div>
  );
}

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
  currentFilterIsCustom,
  currentFilterName,
  customFilterSet,
  onToggleFilterMembership,
  onBulkSetFilterMembership,
  isCustomAct,
  onRenameAct,
  onDeleteAct,
  onMoveAct,
  onUpdateQuest,
  onDeleteQuest,
  onAddQuest,
  onReorderQuests,
  newlyAddedQuestId
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

  const bgColor = ACT_COLORS[act.id] || ACT_COLORS.default;

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

  return (
    <div id={act.id} className={`mb-8 glass-card rounded-lg p-6 ${bgColor}`}>
      <div className="mb-4 pb-3 border-b flex items-center justify-between gap-2" style={{ borderColor: 'var(--border-glow)' }}>
        {isEditMode ? (
          <input
            value={act.name}
            onChange={(e) => onRenameAct(act.id, e.target.value)}
            className="text-2xl font-title font-semibold bg-transparent outline-none min-w-0 flex-1"
            style={{
              color: 'var(--gold-primary)',
              border: '1px solid rgba(212,175,55,0.4)',
              borderRadius: '4px',
              padding: '2px 8px',
            }}
          />
        ) : (
          <h2 className="text-2xl font-title font-semibold flex-1"
              style={{ color: 'var(--gold-primary)' }}>
            {act.name}
          </h2>
        )}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {isEditMode && currentFilterIsCustom && (
            <>
              <button
                onClick={() => onBulkSetFilterMembership(act.quests.map(q => q.id), true)}
                className="text-xs px-2 py-0.5 rounded transition-colors"
                style={{ color: 'var(--gold-primary)', background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)' }}
              >
                전체선택
              </button>
              <button
                onClick={() => onBulkSetFilterMembership(act.quests.map(q => q.id), false)}
                className="text-xs px-2 py-0.5 rounded transition-colors"
                style={{ color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)' }}
              >
                해제
              </button>
            </>
          )}
          {isEditMode && (
            <button
              onClick={() => { if (window.confirm(`액트를 숨김하시겠습니까?\n(하단에서 복구 가능)`)) onDeleteAct(act.id); }}
              className="text-xs px-2 py-0.5 rounded transition-colors"
              style={{ color: '#f87171', background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)' }}
            >
              숨김
            </button>
          )}
          {isEditMode && (
            <div className="flex items-center gap-1">
              <span className="text-xs" style={{ color: 'var(--text-secondary)', opacity: 0.6, whiteSpace: 'nowrap' }}>Act 순서</span>
              <button
                onClick={() => onMoveAct(act.id, 'up')}
                className="text-xs px-1.5 py-0.5 rounded transition-colors"
                style={{ color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                title="위로 이동"
              >▲</button>
              <button
                onClick={() => onMoveAct(act.id, 'down')}
                className="text-xs px-1.5 py-0.5 rounded transition-colors"
                style={{ color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                title="아래로 이동"
              >▼</button>
            </div>
          )}
        </div>
      </div>

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
            {isEditMode && (
              <InsertDivider onInsert={() => onAddQuest(act.id, 0)} />
            )}
            {act.quests.map((quest, index) => (
              <Fragment key={quest.id}>
                <SortableQuestCard
                  quest={quest}
                  isCompleted={completed.includes(quest.id)}
                  onToggle={onToggle}
                  isEditMode={isEditMode}
                  currentFilterIsCustom={currentFilterIsCustom}
                  currentFilterName={currentFilterName}
                  isCustomEnabled={customFilterSet[quest.id] === true}
                  onToggleFilterMembership={onToggleFilterMembership}
                  onUpdateQuest={onUpdateQuest}
                  onDeleteQuest={onDeleteQuest}
                  isNew={quest.id === newlyAddedQuestId}
                />
                {isEditMode && (
                  <InsertDivider onInsert={() => onAddQuest(act.id, index + 1)} />
                )}
              </Fragment>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

export default ActGroup;
