import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';

function GuideModal({ isOpen, onClose }) {
  const [guideContent, setGuideContent] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetch('/data/Practice.md')
        .then(res => res.text())
        .then(text => setGuideContent(text))
        .catch(err => console.error('Failed to load guide:', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm">
      <div className="bg-poe-dark border border-poe-border/50 rounded-lg max-w-3xl max-h-[90vh] overflow-y-auto w-full shadow-2xl">
        {/* 헤더 */}
        <div className="sticky top-0 bg-[#0f1419] border-b border-poe-border/30 p-4 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-yellow-500">📖 사용 안내</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl leading-none px-2"
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        {/* 내용 */}
        <div className="p-6 prose prose-invert prose-yellow max-w-none">
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1 className="text-2xl font-bold text-yellow-500 mb-4 border-b-2 border-yellow-500/30 pb-2">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-xl font-bold text-yellow-400 mt-6 mb-3">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-lg font-bold text-yellow-300 mt-4 mb-2">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="text-gray-300 mb-3 leading-relaxed">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside space-y-2 mb-4 text-gray-300">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside space-y-2 mb-4 text-gray-300">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="ml-2">{children}</li>
              ),
              strong: ({ children }) => (
                <strong className="text-yellow-400 font-semibold">
                  {children}
                </strong>
              ),
              code: ({ children }) => (
                <code className="bg-poe-dark px-2 py-1 rounded text-green-400 text-sm">
                  {children}
                </code>
              ),
              hr: () => (
                <hr className="border-poe-border my-6" />
              ),
            }}
          >
            {guideContent}
          </ReactMarkdown>
        </div>

        {/* 푸터 */}
        <div className="sticky bottom-0 bg-[#0f1419] border-t border-poe-border/30 p-4 flex justify-end z-10">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors font-medium"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}

export default GuideModal;
