import { useEffect, useImperativeHandle, useRef, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { useKakaoMap } from '../../hooks/useKakaoMap';
import { usePins } from '../../hooks/usePins';
import { loadLastPosition, saveLastPosition, LAST_POSITION_DEBOUNCE_MS } from '../../utils/lastPosition';
import { cn } from '@/lib/utils';

// OKLCH → hex 변환 (간단한 폴백)
const oklchToHex = (oklch) => {
  // CSS 변수가 hex가 아닐 경우 대비한 폴백
  const map = {
    'restaurants': '#FF6B35',
    'cafes': '#8B4513',
    'default': '#0070F3',
  };
  return map[oklch] || '#0070F3';
};

const buildPinSvg = (hexColor) => `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 40" width="32" height="40">
    <defs>
      <filter id="pinShadow" x="-20%" y="-10%" width="140%" height="130%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.25"/>
      </filter>
    </defs>
    <path d="M16 0 C7.16 0 0 7.16 0 16 C0 28 16 40 16 40 C16 40 32 28 32 16 C32 7.16 24.84 0 16 0 Z"
          fill="${hexColor}" stroke="white" stroke-width="1.5" filter="url(#pinShadow)"/>
    <circle cx="16" cy="16" r="5.5" fill="white"/>
  </svg>
`;

function createMarkerImage(color) {
  return new window.kakao.maps.MarkerImage(
    `data:image/svg+xml;charset=utf-8,${encodeURIComponent(buildPinSvg(color))}`,
    new window.kakao.maps.Size(32, 40),
    { offset: new window.kakao.maps.Point(16, 40) },
  );
}

export const MapView = forwardRef(function MapView({ onMapClick, onPinClick, className }, ref) {
  const containerRef = useRef(null);
  const { isLoading, error, map } = useKakaoMap(containerRef, () => {
    const last = loadLastPosition();
    return {
      center: new window.kakao.maps.LatLng(last?.lat ?? 37.5665, last?.lng ?? 126.9780),
      level: last?.level ?? 3,
    };
  });
  const { pins } = usePins();
  const markersRef = useRef([]);

  useImperativeHandle(ref, () => ({
    panTo(lat, lng) {
      if (!map) return;
      map.panTo(new window.kakao.maps.LatLng(lat, lng));
    },
    getCenter() {
      if (!map) return null;
      const c = map.getCenter();
      return { lat: c.getLat(), lng: c.getLng() };
    },
  }), [map]);

  // 빈 지도 클릭 → 새 핀 좌표
  useEffect(() => {
    if (!map) return undefined;
    const handler = (mouseEvent) => {
      const lat = mouseEvent.latLng.getLat();
      const lng = mouseEvent.latLng.getLng();
      onMapClick?.(lat, lng);
    };
    window.kakao.maps.event.addListener(map, 'click', handler);
    return () => {
      window.kakao.maps.event.removeListener(map, 'click', handler);
    };
  }, [map, onMapClick]);

  // 마지막 위치 저장 (debounce)
  useEffect(() => {
    if (!map) return undefined;
    let timeoutId = null;
    const persist = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const c = map.getCenter();
        saveLastPosition(c.getLat(), c.getLng(), map.getLevel());
      }, LAST_POSITION_DEBOUNCE_MS);
    };
    window.kakao.maps.event.addListener(map, 'center_changed', persist);
    window.kakao.maps.event.addListener(map, 'zoom_changed', persist);
    return () => {
      window.kakao.maps.event.removeListener(map, 'center_changed', persist);
      window.kakao.maps.event.removeListener(map, 'zoom_changed', persist);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [map]);

  // 핀 마커 렌더
  useEffect(() => {
    if (!map) return undefined;

    const clearMarkers = () => {
      markersRef.current.forEach(({ marker, clickHandler }) => {
        window.kakao.maps.event.removeListener(marker, 'click', clickHandler);
        marker.setMap(null);
      });
      markersRef.current = [];
    };

    clearMarkers();

    pins.forEach((pin) => {
      const color = oklchToHex(pin.groupId || 'default');
      const image = createMarkerImage(color);
      const marker = new window.kakao.maps.Marker({
        position: new window.kakao.maps.LatLng(pin.lat, pin.lng),
        map,
        image,
        title: pin.title || '',
      });
      const clickHandler = () => onPinClick?.(pin);
      window.kakao.maps.event.addListener(marker, 'click', clickHandler);
      markersRef.current.push({ marker, clickHandler });
    });

    return clearMarkers;
  }, [map, pins, onPinClick]);

  return (
    <div className={cn('relative w-full h-full', className)}>
      <div ref={containerRef} className="w-full h-full" />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 pointer-events-none">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}
      {error && (
        <div className="absolute top-4 left-4 right-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error.message}
        </div>
      )}
    </div>
  );
});
