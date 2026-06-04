import { useCallback, useRef, useState } from 'react';
import { TopBar } from './components/chrome/TopBar';
import { Fab } from './components/chrome/Fab';
import { MapView } from './components/map/MapView';
import { NewPinSheet } from './components/sheets/NewPinSheet';
import { PinDetailSheet } from './components/sheets/PinDetailSheet';
import { PlaceSearchSheet } from './components/sheets/PlaceSearchSheet';
import { DevUserSwitcher } from './components/auth/DevUserSwitcher';
import { Toaster } from './components/ui/sonner';

const DEFAULT_CENTER = { lat: 37.5665, lng: 126.9780 };  // 시청

function App() {
  const mapRef = useRef(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
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
    if (mapRef.current) mapRef.current.panTo(lat, lng);
    setNewPinCoords({ lat, lng });
  }, []);

  const handleFabClick = useCallback(() => {
    const center = mapRef.current?.getCenter() ?? DEFAULT_CENTER;
    setNewPinCoords(center);
  }, []);

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden bg-background text-foreground">
      <TopBar
        onSearchClick={() => setSearchOpen(true)}
        onProfileClick={() => setProfileOpen(true)}
      />

      <div className="flex-1 relative min-h-0">
        <MapView ref={mapRef} onMapClick={handleMapClick} onPinClick={handlePinClick} />
        <Fab onClick={handleFabClick} />
      </div>

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
        open={profileOpen}
        onOpenChange={setProfileOpen}
      />

      <Toaster />
    </div>
  );
}

export default App;
