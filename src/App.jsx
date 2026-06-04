import { useRef } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { useKakaoMap } from './hooks/useKakaoMap';

// 카카오 본사 (제주 아님) 좌표 — 기본 중심점
const DEFAULT_CENTER = { lat: 33.450701, lng: 126.570667 };
const DEFAULT_LEVEL = 3;

function App() {
  const mapRef = useRef(null);

  const { isLoading, error } = useKakaoMap(mapRef, () => ({
    center: new window.kakao.maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng),
    level: DEFAULT_LEVEL,
  }));

  return (
    <Box sx={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h6">카카오맵</Typography>
      </Box>
      <Box sx={{ flex: 1, width: '100%', position: 'relative', minHeight: 0 }}>
        <Box id="map" ref={mapRef} sx={{ width: '100%', height: '100%' }} />
        {isLoading && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <CircularProgress />
          </Box>
        )}
        {error && (
          <Box sx={{ position: 'absolute', top: 16, left: 16, right: 16 }}>
            <Alert severity="error">지도를 불러올 수 없습니다: {error.message}</Alert>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default App;
