import { useState, useRef } from 'react';
import { downloadCsvTemplate, exportToCsv, parseCsv } from '../utils/csvQuests';

function DataModal({ isOpen, onClose, actsData, completed, filterDefs, customFilterSets, activeFilter, onImport }) {
  const [step, setStep] = useState('main');
  const [parsedItems, setParsedItems] = useState([]);
  const [parseErrors, setParseErrors] = useState([]);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const { items, errors } = parseCsv(ev.target.result);
      if (items.length === 0) {
        setParseErrors(errors.length ? errors : ['가져올 퀘스트가 없습니다.']);
        setStep('error');
      } else {
        setParsedItems(items);
        setParseErrors(errors);
        setStep('option');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleConfirm = (includeCompleted) => {
    onImport(parsedItems, includeCompleted);
    setStep('done');
  };

  const handleClose = () => {
    setStep('main');
    setParsedItems([]);
    setParseErrors([]);
    onClose();
  };

  const activeDef = filterDefs?.find(f => f.id === activeFilter);
  const activeFilterName = activeDef?.name || activeFilter;

  const renderContent = () => {
    if (step === 'option') {
      return (
        <>
          <h2 className="text-xl font-title font-bold mb-3" style={{ color: 'var(--gold-primary)' }}>
            가져오기 옵션
          </h2>
          <p className="text-sm text-gray-300 mb-2">
            <span style={{ color: 'var(--gold-light)' }} className="font-semibold">{parsedItems.length}개</span> 퀘스트를 불러왔습니다.
          </p>
          {parseErrors.length > 0 && (
            <div className="mb-3 text-xs text-yellow-400 bg-yellow-900/20 rounded p-2">
              {parseErrors.length}개 행에 오류가 있어 건너뜁니다.
            </div>
          )}
          <p className="text-sm text-gray-400 mb-4">어떻게 가져오시겠습니까?</p>
          <div className="space-y-3 mb-4">
            <button
              onClick={() => handleConfirm(false)}
              className="w-full px-4 py-3 rounded-lg text-left bg-poe-dark border border-poe-border hover:border-yellow-500/50 transition-colors"
            >
              <div className="font-semibold text-white text-sm">목록만 가져오기</div>
              <div className="text-xs text-gray-400 mt-0.5">퀘스트 목록만 추가합니다. 완료 체크는 무시됩니다.</div>
            </button>
            <button
              onClick={() => handleConfirm(true)}
              className="w-full px-4 py-3 rounded-lg text-left bg-poe-dark border border-poe-border hover:border-yellow-500/50 transition-colors"
            >
              <div className="font-semibold text-white text-sm">진행상황 포함 가져오기</div>
              <div className="text-xs text-gray-400 mt-0.5">완료 체크까지 함께 복원합니다. 내 백업 파일 복원 시 사용하세요.</div>
            </button>
          </div>
          <button
            onClick={() => setStep('main')}
            className="w-full px-4 py-2 rounded-lg text-sm bg-gray-700 hover:bg-gray-600 text-white transition-colors"
          >
            취소
          </button>
        </>
      );
    }

    if (step === 'error') {
      return (
        <>
          <h2 className="text-xl font-title font-bold mb-4 text-red-400">가져오기 실패</h2>
          <div className="text-sm text-gray-300 mb-4 space-y-1 max-h-40 overflow-y-auto">
            {parseErrors.map((err, i) => <p key={i}>• {err}</p>)}
          </div>
          <button
            onClick={() => setStep('main')}
            className="w-full px-4 py-2 rounded-lg text-sm bg-gray-700 hover:bg-gray-600 text-white transition-colors"
          >
            돌아가기
          </button>
        </>
      );
    }

    if (step === 'done') {
      return (
        <>
          <h2 className="text-xl font-title font-bold mb-3 text-green-400">가져오기 완료</h2>
          <p className="text-sm text-gray-300 mb-6">{parsedItems.length}개 퀘스트가 추가됐습니다.</p>
          <button
            onClick={handleClose}
            className="w-full px-4 py-2 rounded-lg text-sm bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white transition-colors font-semibold"
          >
            확인
          </button>
        </>
      );
    }

    return (
      <>
        <h2 className="text-2xl font-title font-bold mb-6"
            style={{
              background: 'var(--gradient-gold)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
          데이터 관리
        </h2>

        <div className="space-y-3 mb-6">
          <div className="bg-poe-dark border border-poe-border rounded-lg p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white mb-0.5">CSV 내보내기</div>
                <div className="text-xs text-gray-400">
                  현재 필터(<span className="text-yellow-400">{activeFilterName}</span>)의 퀘스트를 CSV로 저장합니다.
                </div>
              </div>
              <button
                onClick={() => actsData && exportToCsv(actsData, completed, filterDefs, customFilterSets, activeFilter)}
                className="px-3 py-1.5 text-xs rounded bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold transition-all shrink-0"
              >
                내보내기
              </button>
            </div>
          </div>

          <div className="bg-poe-dark border border-poe-border rounded-lg p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white mb-0.5">CSV 가져오기</div>
                <div className="text-xs text-gray-400">CSV 파일을 업로드해 커스텀 퀘스트를 추가합니다.</div>
              </div>
              <label className="px-3 py-1.5 text-xs rounded bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold transition-all cursor-pointer shrink-0">
                파일 선택
                <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
              </label>
            </div>
          </div>

          <div className="bg-poe-dark border border-poe-border rounded-lg p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white mb-0.5">빈 양식 다운로드</div>
                <div className="text-xs text-gray-400">Google Sheets / Excel에서 작성할 수 있는 양식입니다.</div>
              </div>
              <button
                onClick={() => downloadCsvTemplate(filterDefs)}
                className="px-3 py-1.5 text-xs rounded bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold transition-all shrink-0"
              >
                양식 받기
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={handleClose}
          className="w-full px-4 py-2 rounded-lg font-body font-medium transition-all text-sm bg-gray-600 hover:bg-gray-700 text-white"
        >
          닫기
        </button>
      </>
    );
  };

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4 backdrop-blur-md"
         style={{ background: 'rgba(10, 10, 15, 0.95)' }}>
      <div className="glass-card rounded-xl max-w-lg w-full p-6">
        {renderContent()}
      </div>
    </div>
  );
}

export default DataModal;
