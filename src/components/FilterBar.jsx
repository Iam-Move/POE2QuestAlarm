import { FILTER_MODES, FILTER_LABELS, FILTER_COLORS } from '../utils/filters';

function FilterBar({ currentFilter, onFilterChange }) {
  const filters = [
    FILTER_MODES.REGULAR,
    FILTER_MODES.SEMI_STRICT,
    FILTER_MODES.UBER,
    FILTER_MODES.CUSTOM
  ];

  return (
    <div className="grid grid-cols-2 sm:flex gap-2">
      {filters.map(filter => {
        const isActive = currentFilter === filter;
        const colorClass = FILTER_COLORS[filter];

        return (
          <button
            key={filter}
            onClick={() => onFilterChange(filter)}
            className={`
              px-3 sm:px-4 py-2 sm:py-2 rounded-lg font-medium transition-all border-2 text-sm sm:text-base w-full sm:w-auto
              ${isActive
                ? `${colorClass} text-white sm:scale-105 shadow-lg border-transparent ring-2 ring-offset-2 ring-offset-poe-dark`
                : 'bg-poe-card/20 text-gray-600 hover:text-gray-400 hover:bg-poe-card/30 border-poe-border/10 opacity-50'
              }
            `}
            style={isActive ? {} : { filter: 'grayscale(50%)' }}
          >
            {FILTER_LABELS[filter]}
            {isActive && <span className="ml-1 sm:ml-2 text-base sm:text-lg">●</span>}
          </button>
        );
      })}
    </div>
  );
}

export default FilterBar;
