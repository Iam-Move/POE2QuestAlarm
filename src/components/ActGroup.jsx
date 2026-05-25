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
  currentFilter,
  customFilters,
  onToggleCustom,
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
    <div className={`mb-8 glass-card rounded-lg p-6 ${bgColor}`}>
      <div className="mb-4 pb-3 border-b" style={{ borderColor: 'var(--border-glow)' }}>
        <h2 className="text-2xl font-title font-semibold"
            style={{ color: 'var(--gold-primary)' }}>
          {act.name}
        </h2>
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
                  currentFilter={currentFilter}
                  isCustomEnabled={customFilters[quest.id] === true}
                  onToggleCustom={onToggleCustom}
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
