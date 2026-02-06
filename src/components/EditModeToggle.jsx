function EditModeToggle({ isEditMode, onToggle }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-body" style={{ color: 'var(--text-secondary)' }}>
        편집 모드
      </span>
      <button
        onClick={onToggle}
        className="relative inline-flex items-center cursor-pointer focus:outline-none"
        aria-label="편집 모드 토글"
        title={isEditMode ? '편집 모드 끄기' : '편집 모드 켜기'}
      >
        <div
          className={`
            relative w-16 h-8 rounded-full transition-all duration-300 ease-in-out
            ${isEditMode ? 'bg-green-500' : 'bg-gray-400'}
          `}
        >
          {/* 토글 원 */}
          <div
            className={`
              absolute top-1 w-6 h-6 bg-white rounded-full shadow-md
              transition-all duration-300 ease-in-out
              ${isEditMode ? 'left-9' : 'left-1'}
            `}
          />

          {/* 텍스트 */}
          <span
            className={`
              absolute top-1/2 -translate-y-1/2 text-xs font-bold
              transition-opacity duration-200
              ${isEditMode ? 'left-2 text-white' : 'right-2 text-white'}
            `}
          >
            {isEditMode ? 'ON' : 'OFF'}
          </span>
        </div>
      </button>
    </div>
  );
}

export default EditModeToggle;
