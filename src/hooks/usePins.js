import { useEffect, useState } from 'react';
import { dataAdapter } from '../services/dataAdapter';

/**
 * React hook that subscribes to the pin collection exposed by the data
 * adapter and exposes mutation helpers. Thin wrapper: the `list`
 * subscription is the single source of truth for `pins`, so the mutation
 * methods only delegate to the adapter and rely on the broadcast to
 * refresh state.
 *
 * @returns {{
 *   pins: object[],
 *   createPin: (pin: object) => object,
 *   updatePin: (id: string, patch: object) => object,
 *   deletePin: (id: string) => void,
 *   toggleLike: (pinId: string, userId: string) => object,
 * }}
 */
export function usePins() {
  const [pins, setPins] = useState(() => []);

  useEffect(() => {
    return dataAdapter.pins.list((next) => setPins([...next]));
  }, []);

  const createPin = (pin) => dataAdapter.pins.create(pin);
  const updatePin = (id, patch) => dataAdapter.pins.update(id, patch);
  const deletePin = (id) => dataAdapter.pins.delete(id);
  const toggleLike = (pinId, userId) => dataAdapter.pins.toggleLike(pinId, userId);

  return { pins, createPin, updatePin, deletePin, toggleLike };
}
