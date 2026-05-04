/**
 * PIP (Picture-in-Picture) API 유틸리티
 */

let pipWindow = null;

/**
 * PIP API 지원 여부 확인
 */
export function isPipSupported() {
  return 'documentPictureInPicture' in window;
}

/**
 * PIP 창 열기
 */
export async function openPipWindow(width = 400, height = 600) {
  if (!isPipSupported()) {
    throw new Error('이 브라우저는 PIP를 지원하지 않습니다. Chrome 111+ 이상을 사용하세요.');
  }

  try {
    // 이미 열려있으면 닫기
    if (pipWindow && !pipWindow.closed) {
      pipWindow.close();
    }

    // PIP 창 열기
    pipWindow = await window.documentPictureInPicture.requestWindow({
      width,
      height,
    });

    // 스타일시트 복사
    copyStylesToWindow(pipWindow);

    return pipWindow;
  } catch (error) {
    console.error('PIP 창 열기 실패:', error);
    throw error;
  }
}

/**
 * PIP 창 닫기
 */
export function closePipWindow() {
  if (pipWindow && !pipWindow.closed) {
    pipWindow.close();
    pipWindow = null;
  }
}

/**
 * PIP 창이 열려있는지 확인
 */
export function isPipWindowOpen() {
  return pipWindow && !pipWindow.closed;
}

/**
 * 현재 PIP 창 가져오기
 */
export function getPipWindow() {
  return pipWindow;
}

/**
 * 메인 창의 스타일시트를 PIP 창에 복사
 */
function copyStylesToWindow(targetWindow) {
  // 모든 스타일시트 복사
  [...document.styleSheets].forEach((styleSheet) => {
    try {
      if (styleSheet.href) {
        // 외부 스타일시트
        const link = targetWindow.document.createElement('link');
        link.rel = 'stylesheet';
        link.href = styleSheet.href;
        targetWindow.document.head.appendChild(link);
      } else if (styleSheet.cssRules) {
        // 인라인 스타일시트
        const style = targetWindow.document.createElement('style');
        const cssText = [...styleSheet.cssRules]
          .map(rule => rule.cssText)
          .join('\n');
        style.textContent = cssText;
        targetWindow.document.head.appendChild(style);
      }
    } catch (e) {
      console.warn('스타일시트 복사 실패:', e);
    }
  });

  // body 배경색 설정
  targetWindow.document.body.style.backgroundColor = '#1a1a1a';
  targetWindow.document.body.style.margin = '0';
  targetWindow.document.body.style.padding = '0';
  targetWindow.document.body.style.overflow = 'auto';
}
