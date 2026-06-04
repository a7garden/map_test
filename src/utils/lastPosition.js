const KEY = 'map:lastPosition:v1';
const SAVE_DEBOUNCE_MS = 500;

/**
 * 마지막 지도 중심 위치를 localStorage에 저장/복원한다.
 * Pan/zoom 시 debounce로 저장하고, 앱 시작 시 복원한다.
 */

export function loadLastPosition() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      typeof parsed?.lat === 'number' &&
      typeof parsed?.lng === 'number' &&
      typeof parsed?.level === 'number'
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveLastPosition(lat, lng, level) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ lat, lng, level }));
  } catch (err) {
    console.warn('[lastPosition] save failed:', err);
  }
}

export const LAST_POSITION_DEBOUNCE_MS = SAVE_DEBOUNCE_MS;
