function SharedSettingsAlert({ title, description, onReplace, onMerge, onCancel }) {
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

        <p className="text-xs text-gray-400 mt-3 mb-6">
          <span className="text-yellow-400 font-semibold">교체하기</span>: 현재 설정 전체를 공유된 설정으로 덮어씁니다.
          <br />
          <span className="text-green-400 font-semibold">합치기</span>: 공유된 커스텀 필터와 퀘스트만 내 설정에 추가합니다.
        </p>

        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              onClick={onMerge}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded transition-colors"
            >
              합치기
            </button>
            <button
              onClick={onReplace}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded transition-colors"
            >
              교체하기
            </button>
          </div>
          <button
            onClick={onCancel}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 rounded transition-colors"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}

export default SharedSettingsAlert;
