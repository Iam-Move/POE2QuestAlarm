import { useState } from 'react';
import ShareDialog from './ShareDialog';

function ShareButton({ filter, completed, customFilters }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsDialogOpen(true)}
        className="px-4 py-2 rounded-lg font-body font-semibold transition-all text-sm bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white shadow-lg hover:shadow-xl hover:scale-105"
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
