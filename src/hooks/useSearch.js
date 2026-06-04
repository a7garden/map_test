import { useState, useEffect, useCallback } from 'react';

const SDK_SRC_PATTERN = 'dapi.kakao.com/v2/maps/sdk.js';
const DEBOUNCE_MS = 300;

function waitForKakao() {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.kakao?.maps?.load) {
      resolve();
      return;
    }
    const script = document.querySelector(`script[src*="${SDK_SRC_PATTERN}"]`);
    if (script) {
      script.addEventListener('load', () => resolve(), { once: true });
      script.addEventListener(
        'error',
        () => reject(new Error('Kakao Maps SDK script load failed')),
        { once: true },
      );
      return;
    }
    reject(new Error('Kakao Maps SDK <script> tag not found in index.html'));
  });
}

function kakaoSearch(query) {
  return new Promise((resolve, reject) => {
    window.kakao.maps.load(() => {
      const ps = new window.kakao.maps.services.Places();
      ps.keywordSearch(query, (data, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          resolve(data);
        } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
          resolve([]);
        } else {
          reject(new Error(`Kakao Places search failed: ${status}`));
        }
      });
    });
  });
}

/**
 * Kakao Maps Places 키워드 검색 API를 감싸는 React 훅.
 * query가 바뀔 때 300ms 디바운스 후 검색을 실행한다.
 * 빈 query일 때는 결과/로딩/에러 상태를 render 시점에 query로부터 derive한다
 * (React 19 set-state-in-effect 규칙 회피).
 *
 * @returns {{
 *   query: string,
 *   setQuery: (q: string) => void,
 *   results: object[],
 *   isSearching: boolean,
 *   error: Error|null,
 *   search: (q: string) => void,
 *   clear: () => void
 * }}
 */
export function useSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);

  // 빈 query면 결과/로딩/에러를 빈 값으로 derive (effect 안에서 setState 안 해도 됨)
  const trimmedQuery = query.trim();
  const displayResults = trimmedQuery ? results : [];
  const displayIsSearching = trimmedQuery ? isSearching : false;
  const displayError = trimmedQuery ? error : null;

  useEffect(() => {
    if (!trimmedQuery) return undefined;

    // 로컬 cancelled 클로저 — React 19 StrictMode 더블 이펙트에서
    // 각 effect 실행이 독립적인 취소 플래그를 갖도록 한다.
    let cancelled = false;
    // 디바운스 직후 로딩 상태 진입. effect body에서 setState이지만
    // 디바운스/async 작업의 시작을 명시적으로 알리는 의도된 호출.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsSearching(true);

    const timeoutId = setTimeout(async () => {
      try {
        await waitForKakao();
        if (cancelled) return;
        const data = await kakaoSearch(trimmedQuery);
        if (cancelled) return;
        setResults(data);
        setError(null);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e : new Error(String(e)));
          setResults([]);
        }
      } finally {
        if (!cancelled) setIsSearching(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [trimmedQuery]);

  const search = useCallback((q) => setQuery(q), []);
  const clear = useCallback(() => {
    // 다른 상태는 render 시점에 빈 query로부터 derive되므로
    // 명시적으로 reset할 필요 없음
    setQuery('');
  }, []);

  return {
    query,
    setQuery,
    results: displayResults,
    isSearching: displayIsSearching,
    error: displayError,
    search,
    clear,
  };
}
