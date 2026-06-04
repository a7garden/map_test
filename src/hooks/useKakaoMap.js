import { useEffect, useRef, useState } from 'react';

const SDK_SRC_PATTERN = 'dapi.kakao.com/v2/maps/sdk.js';

/**
 * index.html에 <script src="https://dapi.kakao.com/v2/maps/sdk.js?autoload=false">로
 * 로드된 카카오맵 SDK가 준비될 때까지 기다린 뒤 containerRef에 지도를 생성한다.
 *
 * optionsFactory는 kakao.maps.load 콜백 내부에서 호출되므로,
 * 그 안에서 window.kakao.maps.* API를 안전하게 사용할 수 있다.
 *
 * @param {React.RefObject<HTMLElement>} containerRef 지도 컨테이너 ref
 * @param {() => kakao.maps.MapOptions} optionsFactory MapOptions를 반환하는 팩토리
 * @returns {{ isLoading: boolean, error: Error|null, map: kakao.maps.Map|null }}
 */
function waitForKakaoSDK() {
  return new Promise((resolve, reject) => {
    // 케이스 1: 이미 로드 완료
    if (typeof window !== 'undefined' && window.kakao?.maps?.load) {
      resolve();
      return;
    }
    // 케이스 2: <script> 태그는 있지만 아직 로딩 중
    const script = document.querySelector(`script[src*="${SDK_SRC_PATTERN}"]`);
    if (script) {
      script.addEventListener('load', () => resolve(), { once: true });
      script.addEventListener(
        'error',
        () => reject(new Error('Kakao Maps SDK 스크립트 로드 실패')),
        { once: true },
      );
      return;
    }
    reject(new Error('index.html에 Kakao Maps SDK <script> 태그가 없습니다.'));
  });
}

export function useKakaoMap(containerRef, optionsFactory) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [map, setMap] = useState(null);

  // optionsFactory는 매 렌더마다 새 함수가 들어올 수 있으므로 latest-ref 패턴으로 추적
  // (render 중 ref.current 쓰기는 react-hooks/refs 규칙에 위반되므로 effect에서 갱신)
  const factoryRef = useRef(optionsFactory);
  useEffect(() => {
    factoryRef.current = optionsFactory;
  });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await waitForKakaoSDK();
        if (cancelled) return;

        await new Promise((resolve) => {
          window.kakao.maps.load(() => {
            if (cancelled) {
              resolve();
              return;
            }
            const container = containerRef.current;
            if (!container) {
              resolve();
              return;
            }
            // React 19 StrictMode dev 더블 마운트 시 두 번째 effect에서도
            // setMap이 호출되지만, prev가 있으면 그대로 반환하여
            // 동일 컨테이너에 지도를 중복 생성하지 않음
            setMap((prev) => prev ?? new window.kakao.maps.Map(container, factoryRef.current()));
            resolve();
          });
        });

        if (!cancelled) setIsLoading(false);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e : new Error(String(e)));
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // optionsFactory는 factoryRef를 통해 추적하므로 deps에서 제외
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isLoading, error, map };
}
