import { useCallback, useRef, useState } from 'react';
import { Box } from '@mui/material';
import { TopBar } from './components/chrome/TopBar';
import { Fab } from './components/chrome/Fab';
import { MapView } from './components/map/MapView';
import { NewPinSheet } from './components/sheets/NewPinSheet';
import { PinDetailSheet } from './components/sheets/PinDetailSheet';
import { PlaceSearchSheet } from './components/sheets/PlaceSearchSheet';
import { DevUserSwitcher } from './components/auth/DevUserSwitcher';

const DEFAULT_CENTER = { lat: 33.450701, lng: 126.570667 };

function App() {
  const mapRef = useRef(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileAnchor, setProfileAnchor] = useState(null);
  const [newPinCoords, setNewPinCoords] = useState(null);
  const [selectedPin, setSelectedPin] = useState(null);

  const handleMapClick = useCallback((lat, lng) => {
    setNewPinCoords({ lat, lng });
  }, []);

  const handlePinClick = useCallback((pin) => {
    setSelectedPin(pin);
  }, []);

  const handleSearchSelect = useCallback((place) => {
    const lat = parseFloat(place.y);
    const lng = parseFloat(place.x);
    if (mapRef.current) {
      mapRef.current.panTo(lat, lng);
    }
    setNewPinCoords({ lat, lng });
  }, []);

  const handleFabClick = useCallback(() => {
    const center = mapRef.current?.getCenter() ?? DEFAULT_CENTER;
    setNewPinCoords(center);
  }, []);

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <TopBar
        onSearchClick={() => setSearchOpen(true)}
        onProfileClick={(e) => setProfileAnchor(e.currentTarget)}
      />
      <Box sx={{ flex: 1, position: 'relative', minHeight: 0 }}>
        <MapView ref={mapRef} onMapClick={handleMapClick} onPinClick={handlePinClick} />
        <Fab onClick={handleFabClick} />
      </Box>

      <PlaceSearchSheet
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelect={handleSearchSelect}
      />
      <NewPinSheet
        open={Boolean(newPinCoords)}
        onClose={() => setNewPinCoords(null)}
        lat={newPinCoords?.lat ?? DEFAULT_CENTER.lat}
        lng={newPinCoords?.lng ?? DEFAULT_CENTER.lng}
      />
      <PinDetailSheet
        open={Boolean(selectedPin)}
        onClose={() => setSelectedPin(null)}
        pin={selectedPin}
      />
      <DevUserSwitcher
        anchorEl={profileAnchor}
        open={Boolean(profileAnchor)}
        onClose={() => setProfileAnchor(null)}
      />
    </Box>
  );
}

export default App;
