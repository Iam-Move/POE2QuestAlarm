import { useState } from 'react';

function FilterBar({
  filterDefs,
  activeFilter,
  onFilterChange,
  isEditMode,
  onRenameFilter,
  onHideFilter,
  onAddFilter
}) {
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [isAddingFilter, setIsAddingFilter] = useState(false);
  const [newFilterName, setNewFilterName] = useState('');

  const visibleFilters = filterDefs.filter(f => f.visible !== false);

  const startEdit = (def) => {
    setEditingId(def.id);
    setEditingName(def.name);
  };

  const commitEdit = () => {
    if (editingId && editingName.trim()) {
      onRenameFilter(editingId, editingName.trim());
    }
    setEditingId(null);
    setEditingName('');
  };

  const commitAdd = () => {
    const name = newFilterName.trim();
    if (name) {
      onAddFilter(name);
      setNewFilterName('');
      setIsAddingFilter(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 glass-card p-2 rounded-xl w-fit">
      {visibleFilters.map(def => {
        const isActive = activeFilter === def.id;
        const isEditing = editingId === def.id;

        return (
          <div key={def.id} className="flex items-center">
            {isEditing ? (
              <input
                autoFocus
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitEdit();
                  if (e.key === 'Escape') { setEditingId(null); setEditingName(''); }
                }}
                className="px-3 py-2 text-xs sm:text-sm rounded-2xl bg-gray-800 border border-yellow-500 text-white outline-none"
                style={{ width: `${Math.max(editingName.length * 10, 80)}px` }}
              />
            ) : (
              <>
                <button
                  onClick={() => onFilterChange(def.id)}
                  onDoubleClick={() => isEditMode && startEdit(def)}
                  title={isEditMode ? '더블클릭하여 이름 변경' : undefined}
                  className={`
                    px-4 py-2.5 font-body transition-all text-xs sm:text-sm whitespace-nowrap
                    ${isEditMode ? 'rounded-l-2xl' : 'rounded-2xl'}
                    ${isActive
                      ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-xl font-semibold'
                      : 'bg-black/40 text-gray-400 hover:text-gray-300 hover:bg-black/50 font-medium'
                    }
                  `}
                >
                  {def.name}
                </button>
                {isEditMode && (
                  <button
                    onClick={() => onHideFilter(def.id)}
                    title="필터 숨기기"
                    className={`
                      px-1.5 py-2.5 rounded-r-2xl font-body transition-all text-sm leading-none
                      ${isActive
                        ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-yellow-200 hover:text-red-300'
                        : 'bg-black/40 text-gray-500 hover:text-red-400 hover:bg-black/60'
                      }
                    `}
                  >
                    ×
                  </button>
                )}
              </>
            )}
          </div>
        );
      })}

      {isEditMode && (
        isAddingFilter ? (
          <div className="flex items-center gap-1 px-1">
            <input
              autoFocus
              value={newFilterName}
              onChange={(e) => setNewFilterName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitAdd();
                if (e.key === 'Escape') { setIsAddingFilter(false); setNewFilterName(''); }
              }}
              onBlur={() => {
                if (!newFilterName.trim()) { setIsAddingFilter(false); }
              }}
              placeholder="필터 이름"
              className="px-2 py-1 text-xs rounded-lg bg-gray-800 border border-green-500 text-white outline-none"
              style={{ width: '90px' }}
            />
            <button
              onMouseDown={(e) => { e.preventDefault(); commitAdd(); }}
              className="text-green-400 hover:text-green-300 text-sm font-bold"
            >
              ✓
            </button>
            <button
              onMouseDown={(e) => { e.preventDefault(); setIsAddingFilter(false); setNewFilterName(''); }}
              className="text-gray-400 hover:text-red-400 text-sm"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingFilter(true)}
            className="px-3 py-2 rounded-2xl font-body transition-all text-xs text-green-400 hover:text-green-300 border border-dashed border-green-600/50 hover:border-green-400"
          >
            + 필터 추가
          </button>
        )
      )}
    </div>
  );
}

export default FilterBar;
