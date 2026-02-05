import { useState } from 'react';
import ShareDialog from './ShareDialog';

function ShareButton({ filter, completed, customFilters }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsDialogOpen(true)}
        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
      >
        공유
      </button>

      <ShareDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        filter={filter}
        completed={completed}
        customFilters={customFilters}
      />
    </>
  );
}

export default ShareButton;
