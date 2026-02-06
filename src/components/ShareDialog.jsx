import { useState } from 'react';
import { generateShareUrl } from '../utils/share';

function ShareDialog({ isOpen, onClose, filter, completed, customFilters }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = () => {
    const state = {
      filter,
      completed,
      customFilters,
      title: title.trim(),
      description: description.trim()
    };

    const url = generateShareUrl(state);
    if (url) {
      setShareUrl(url);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      alert('복사 실패: ' + error.message);
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setShareUrl('');
    setCopied(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4 backdrop-blur-md"
         style={{ background: 'rgba(10, 10, 15, 0.95)' }}>
      <div className="glass-card rounded-xl max-w-2xl w-full p-6">
        <h2 className="text-2xl font-title font-bold mb-4"
            style={{
              background: 'var(--gradient-gold)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
          설정 공유하기
        </h2>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              제목 (선택사항)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="IamMove의 POE2 액트 알람"
              className="w-full bg-poe-dark border border-poe-border rounded px-3 py-2 text-white placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              설명 또는 링크 (선택사항)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="https://poe2questalarm.iammove.com"
              rows={3}
              className="w-full bg-poe-dark border border-poe-border rounded px-3 py-2 text-white placeholder-gray-500 resize-none"
            />
          </div>

          {!shareUrl ? (
            <button
              onClick={handleGenerate}
              className="w-full px-4 py-2 rounded-lg font-body font-semibold transition-all text-sm bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white shadow-lg hover:shadow-xl hover:scale-105"
            >
              공유 링크 생성
            </button>
          ) : (
            <div className="space-y-3">
              <div className="bg-poe-dark border border-poe-border rounded p-3">
                <p className="text-xs text-gray-400 mb-1">생성된 공유 링크:</p>
                <p className="text-sm text-green-400 break-all">{shareUrl}</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className={`flex-1 px-4 py-2 rounded-lg font-body font-semibold transition-all text-sm shadow-lg hover:shadow-xl hover:scale-105 ${
                    copied
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                      : 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white'
                  }`}
                >
                  {copied ? '✓ 복사 완료!' : '클립보드에 복사'}
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleClose}
          className="w-full px-4 py-2 rounded-lg font-body font-medium transition-all text-sm bg-gray-600 hover:bg-gray-700 text-white shadow-md hover:shadow-lg"
        >
          닫기
        </button>
      </div>
    </div>
  );
}

export default ShareDialog;
