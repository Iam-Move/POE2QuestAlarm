import { FILTER_MODES, FILTER_LABELS, FILTER_COLORS } from '../utils/filters';

function FilterBar({ currentFilter, onFilterChange }) {
  const filters = [
    FILTER_MODES.REGULAR,
    FILTER_MODES.SEMI_STRICT,
    FILTER_MODES.UBER,
    FILTER_MODES.CUSTOM
  ];

  return (
    <div className="flex flex-wrap gap-2 glass-card p-2 rounded-xl w-fit">
      {filters.map(filter => {
        const isActive = currentFilter === filter;

        return (
          <button
            key={filter}
            onClick={() => onFilterChange(filter)}
            className={`
              px-4 py-2.5 rounded-2xl font-body transition-all text-xs sm:text-sm whitespace-nowrap
              ${isActive
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-xl font-semibold'
                : 'bg-black/40 text-gray-400 hover:text-gray-300 hover:bg-black/50 font-medium'
              }
            `}
          >
            {FILTER_LABELS[filter]}
          </button>
        );
      })}
    </div>
  );
}

export default FilterBar;
