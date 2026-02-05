import LZString from 'lz-string';

const VERSION = 'v1';

/**
 * 상태를 URL 해시로 인코딩
 */
export function encodeStateToUrl(state) {
  try {
    const data = {
      filter: state.filter,
      completed: state.completed,
      customFilters: state.customFilters || {},
      title: state.title || '',
      description: state.description || ''
    };
    const json = JSON.stringify(data);
    const compressed = LZString.compressToEncodedURIComponent(json);
    return `${VERSION}:${compressed}`;
  } catch (error) {
    console.error('상태 인코딩 실패:', error);
    return null;
  }
}

/**
 * URL 해시에서 상태 디코딩
 */
export function decodeStateFromUrl(hash) {
  try {
    if (!hash || !hash.startsWith('#')) return null;

    const content = hash.substring(1); // # 제거
    const [version, compressed] = content.split(':');

    if (version !== VERSION) {
      console.warn('지원하지 않는 버전:', version);
      return null;
    }

    const json = LZString.decompressFromEncodedURIComponent(compressed);
    if (!json) return null;

    const data = JSON.parse(json);
    return {
      filter: data.filter || 'regular',
      completed: data.completed || [],
      customFilters: data.customFilters || {},
      title: data.title || '',
      description: data.description || ''
    };
  } catch (error) {
    console.error('상태 디코딩 실패:', error);
    return null;
  }
}

/**
 * 현재 상태를 URL로 공유
 */
export function generateShareUrl(state) {
  const hash = encodeStateToUrl(state);
  if (!hash) return null;

  const url = new URL(window.location.href);
  url.hash = hash;
  return url.toString();
}

/**
 * 클립보드에 공유 URL 복사
 */
export async function copyShareUrlToClipboard(state) {
  const url = generateShareUrl(state);
  if (!url) {
    throw new Error('URL 생성 실패');
  }

  try {
    await navigator.clipboard.writeText(url);
    return url;
  } catch (error) {
    console.error('클립보드 복사 실패:', error);
    throw error;
  }
}
