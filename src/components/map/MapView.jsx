import { useEffect, useImperativeHandle, useRef, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Box, CircularProgress, Alert } from '@mui/material';
import { useKakaoMap } from '../../hooks/useKakaoMap';
import { usePins } from '../../hooks/usePins';

// 인디고 핀 모양 SVG (32x40) → data URL
const PIN_SVG = encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 40" width="32" height="40">
    <path d="M16 0 C7.16 0 0 7.16 0 16 C0 28 16 40 16 40 C16 40 32 28 32 16 C32 7.16 24.84 0 16 0 Z"
          fill="#3D5AFE" stroke="white" stroke-width="1.5"/>
    <circle cx="16" cy="16" r="5.5" fill="white"/>
  </svg>
`);

function createMarkerImage() {
  return new window.kakao.maps.MarkerImage(
    `data:image/svg+xml;charset=utf-8,${PIN_SVG}`,
    new window.kakao.maps.Size(32, 40),
    { offset: new window.kakao.maps.Point(16, 40) },
  );
}

/**
 * 카카오맵 + 핀 마커 + 클릭 이벤트.
 *
 * @param {object} props
 * @param {(lat:number,lng:number)=>void} [props.onMapClick] 빈 지도 클릭 시
 * @param {(pin)=>void} [props.onPinClick] 핀 클릭 시
 * @param {React.Ref} [ref] 명령형 ref: { panTo(lat,lng), getCenter() }
 */
export const MapView = forwardRef(function MapView({ onMapClick, onPinClick }, ref) {
  const containerRef = useRef(null);
  const { isLoading, error, map } = useKakaoMap(containerRef, () => ({
    center: new window.kakao.maps.LatLng(33.450701, 126.570667),
    level: 3,
  }));
  const { pins } = usePins();
  const markersRef = useRef([]);

  // 외부로 노출할 명령형 API
  useImperativeHandle(
    ref,
    () => ({
      panTo(lat, lng) {
        if (!map) return;
        map.panTo(new window.kakao.maps.LatLng(lat, lng));
      },
      getCenter() {
        if (!map) return null;
        const c = map.getCenter();
        return { lat: c.getLat(), lng: c.getLng() };
      },
    }),
    [map],
  );

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

  // 핀 마커 렌더 (pins 변경 시 재생성)
  useEffect(() => {
    if (!map) return undefined;

    // 기존 마커/리스너 정리
    markersRef.current.forEach(({ marker, clickHandler }) => {
      window.kakao.maps.event.removeListener(marker, 'click', clickHandler);
      marker.setMap(null);
    });
    markersRef.current = [];

    const image = createMarkerImage();

    pins.forEach((pin) => {
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

    return () => {
      // cleanup은 다음 effect 시작 시와 unmount 시 모두 처리됨
    };
  }, [map, pins, onPinClick]);

  return (
    <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
      <Box ref={containerRef} sx={{ width: '100%', height: '100%' }} />
      {isLoading && (
        <CircularProgress
          sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
        />
      )}
      {error && (
        <Alert severity="error" sx={{ position: 'absolute', top: 16, left: 16, right: 16 }}>
          {error.message}
        </Alert>
      )}
    </Box>
  );
});

MapView.propTypes = {
  onMapClick: PropTypes.func,
  onPinClick: PropTypes.func,
};
