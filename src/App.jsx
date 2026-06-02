import { useEffect, useRef } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { useState } from 'react';

function App() {
  const mapRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initMap = () => {
      if (mapRef.current && typeof window.kakao !== 'undefined' && typeof window.kakao.maps.Map !== 'undefined') {
        const options = {
          center: new window.kakao.maps.LatLng(33.450701, 126.570667),
          level: 3,
        };
        new window.kakao.maps.Map(mapRef.current, options);
        setIsLoading(false);
      } else if (typeof window.kakao === 'undefined') {
        setTimeout(initMap, 100);
      } else {
        setIsLoading(false);
      }
    };

    if (document.readyState === 'complete') {
      initMap();
    } else {
      window.addEventListener('load', initMap);
      return () => window.removeEventListener('load', initMap);
    }
  }, []);

  return (
    <Box sx={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h6">카카오맵</Typography>
      </Box>
      <Box sx={{ flex: 1, width: '100%', position: 'relative', minHeight: 0 }}>
        <Box
          id="map"
          ref={mapRef}
          sx={{ width: '100%', height: '100%' }}
        />
        {isLoading && (
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            <CircularProgress />
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default App;