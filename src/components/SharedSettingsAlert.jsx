function SharedSettingsAlert({ title, description, onAccept, onCancel }) {
  // URL에 링크가 있는지 확인
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const hasLink = description && urlRegex.test(description);

  const renderDescription = () => {
    if (!description) return null;

    if (hasLink) {
      const parts = description.split(urlRegex);
      return (
        <div className="text-sm text-gray-300">
          {parts.map((part, index) => {
            if (part.match(urlRegex)) {
              return (
                <a
                  key={index}
                  href={part}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  {part}
                </a>
              );
            }
            return <span key={index}>{part}</span>;
          })}
        </div>
      );
    }

    return <p className="text-sm text-gray-300">{description}</p>;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-poe-card border-2 border-yellow-500 rounded-lg max-w-lg w-full p-6">
        <h2 className="text-xl font-bold text-yellow-500 mb-4">
          {title || '공유된 커스텀 설정'}
        </h2>

        {renderDescription()}

        <div className="mt-6 flex gap-3">
          <button
            onClick={onAccept}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded transition-colors"
          >
            설정 불러오기
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 rounded transition-colors"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}

export default SharedSettingsAlert;
