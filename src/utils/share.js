import LZString from 'lz-string';
import { DEFAULT_FILTER_DEFS } from './filters';

const VERSION = 'v2';

export function encodeStateToUrl(state) {
  try {
    const data = {
      filter: state.filter,
      filterDefs: state.filterDefs,
      customFilterSets: state.customFilterSets || {},
      customQuestData: state.customQuestData || {},
      questOrder: state.questOrder || {},
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

export function decodeStateFromUrl(hash) {
  try {
    if (!hash || !hash.startsWith('#')) return null;

    const content = hash.substring(1);
    const colonIdx = content.indexOf(':');
    if (colonIdx === -1) return null;

    const version = content.substring(0, colonIdx);
    const compressed = content.substring(colonIdx + 1);
    const json = LZString.decompressFromEncodedURIComponent(compressed);
    if (!json) return null;

    const data = JSON.parse(json);

    if (version === 'v2') {
      return {
        filter: data.filter || 'regular',
        filterDefs: data.filterDefs || DEFAULT_FILTER_DEFS,
        customFilterSets: data.customFilterSets || {},
        customQuestData: data.customQuestData || {},
        questOrder: data.questOrder || {},
        title: data.title || '',
        description: data.description || ''
      };
    }

    if (version === 'v1') {
      return {
        filter: data.filter || 'regular',
        filterDefs: DEFAULT_FILTER_DEFS,
        customFilterSets: data.customFilters ? { custom: data.customFilters } : {},
        customQuestData: data.customQuestData || {},
        questOrder: data.questOrder || {},
        title: data.title || '',
        description: data.description || ''
      };
    }

    console.warn('지원하지 않는 버전:', version);
    return null;
  } catch (error) {
    console.error('상태 디코딩 실패:', error);
    return null;
  }
}

export function generateShareUrl(state) {
  const hash = encodeStateToUrl(state);
  if (!hash) return null;

  const url = new URL(window.location.href);
  url.hash = hash;
  return url.toString();
}

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
