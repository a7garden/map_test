/**
 * Phase 1 data adapter — localStorage + BroadcastChannel.
 *
 * Implements the same surface as `dataAdapter.js` so that Phase 2
 * (firebaseAdapter) can be a drop-in replacement. App code MUST NOT
 * import this file directly; go through `dataAdapter` instead.
 *
 * All methods are synchronous. Cross-tab realtime is emulated via
 * BroadcastChannel and falls back to no-op when the API is missing
 * (older browsers / private mode in some Safari versions).
 */

import { DEV_USERS } from '../utils/devUsers';

// ---------------------------------------------------------------------------
// Storage keys (versioned so we can migrate without breaking older tabs)
// ---------------------------------------------------------------------------
const KEYS = Object.freeze({
  pins: 'pins:v1',
  groups: 'groups:v1',
  auth: 'auth:currentUser:v1',
});

// BroadcastChannel topic names — must match the keys in the spec.
const CHANNELS = Object.freeze({
  pins: 'pins-changed',
  groups: 'groups-changed',
  auth: 'auth-changed',
});

// ---------------------------------------------------------------------------
// BroadcastChannel helper
// ---------------------------------------------------------------------------
/**
 * Create a BroadcastChannel, or return null if the runtime lacks support.
 * We swallow the error because some browsers (older Safari, certain
 * iframe contexts) throw on construction.
 *
 * @param {string} name
 * @returns {BroadcastChannel | null}
 */
function _createChannel(name) {
  try {
    if (typeof BroadcastChannel === 'undefined') return null;
    return new BroadcastChannel(name);
  } catch (err) {
    console.warn(`[localAdapter] BroadcastChannel('${name}') unavailable:`, err);
    return null;
  }
}

/**
 * Send a change notification. No-op when channels are unsupported.
 *
 * @param {string} name
 */
function _broadcast(name) {
  const ch = _createChannel(name);
  if (!ch) return;
  try {
    ch.postMessage({ at: Date.now() });
  } catch (err) {
    console.warn(`[localAdapter] postMessage on '${name}' failed:`, err);
  } finally {
    ch.close();
  }
}

/**
 * Subscribe to a channel. The returned function unsubscribes.
 *
 * @param {string} name
 * @param {() => void} cb — invoked on every incoming message
 * @returns {() => void} unsubscribe
 */
function _subscribe(name, cb) {
  const ch = _createChannel(name);
  if (!ch) return () => {};
  const handler = () => cb();
  ch.addEventListener('message', handler);
  return () => {
    try {
      ch.removeEventListener('message', handler);
      ch.close();
    } catch {
      // already closed — ignore
    }
  };
}

// ---------------------------------------------------------------------------
// Storage helpers
// ---------------------------------------------------------------------------
/**
 * Read JSON from localStorage and validate that it is an array.
 * On any error (missing key, bad JSON, wrong shape) returns [] and logs.
 *
 * @param {string} key
 * @returns {unknown[]}
 */
function _readArray(key) {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      console.warn(`[localAdapter] '${key}' is not an array — resetting`);
      return [];
    }
    return parsed;
  } catch (err) {
    console.warn(`[localAdapter] failed to read '${key}':`, err);
    return [];
  }
}

/**
 * Persist a JSON-serializable value. Throws on quota or serialization errors
 * so the caller can decide how to react.
 *
 * @param {string} key
 * @param {unknown} value
 */
function _write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ---------------------------------------------------------------------------
// Public adapter — localStorage implementation
// ---------------------------------------------------------------------------
export const localAdapter = {
  pins: {
    /**
     * Subscribe to the pin list. Emits the current list immediately and
     * again whenever a `'pins-changed'` event arrives from any tab.
     *
     * @param {(pins: object[]) => void} onChange
     * @returns {() => void} unsubscribe
     */
    list(onChange) {
      const emit = () => onChange(_readArray(KEYS.pins));
      emit();
      return _subscribe(CHANNELS.pins, emit);
    },

    /**
     * Append a new pin. Generates `id` (uuid) and `createdAt` (Date.now()).
     * Caller-provided id/createdAt are ignored to keep invariants.
     *
     * @param {{
     *   lat: number,
     *   lng: number,
     *   title?: string,
     *   description?: string,
     *   tags?: string[],
     *   groupId?: string,
     *   authorId: string,
     *   authorName: string,
     *   authorPhoto?: string|null,
     * }} input
     * @returns {object} the persisted pin
     */
    create(pin) {
      const pins = _readArray(KEYS.pins);
      const created = {
        id: crypto.randomUUID(),
        lat: pin.lat,
        lng: pin.lng,
        title: pin.title,
        description: pin.description,
        tags: Array.isArray(pin.tags) ? [...pin.tags] : [],
        groupId: pin.groupId,
        authorId: pin.authorId,
        authorName: pin.authorName,
        authorPhoto: pin.authorPhoto ?? null,
        createdAt: Date.now(),
        likeCount: 0,
        likedBy: [],
      };
      pins.push(created);
      _write(KEYS.pins, pins);
      _broadcast(CHANNELS.pins);
      return created;
    },

    /**
     * Shallow-merge `patch` into the pin with the given id.
     *
     * @param {string} id
     * @param {object} patch
     * @returns {object} the updated pin
     * @throws {Error} if no pin with that id exists
     */
    update(id, patch) {
      const pins = _readArray(KEYS.pins);
      const idx = pins.findIndex((p) => p && p.id === id);
      if (idx === -1) {
        throw new Error(`[localAdapter] pin not found: ${id}`);
      }
      const updated = { ...pins[idx], ...patch, id };
      pins[idx] = updated;
      _write(KEYS.pins, pins);
      _broadcast(CHANNELS.pins);
      return updated;
    },

    /**
     * Remove the pin with the given id. Silent no-op if missing — matches
     * the Firestore `deleteDoc` semantic of idempotent deletion.
     *
     * @param {string} id
     */
    delete(id) {
      const pins = _readArray(KEYS.pins);
      const next = pins.filter((p) => p && p.id !== id);
      if (next.length === pins.length) return;
      _write(KEYS.pins, next);
      _broadcast(CHANNELS.pins);
    },

    /**
     * Toggle a like. If `userId` is already in `likedBy`, remove and
     * decrement; otherwise add and increment. `likeCount` is always
     * recomputed from `likedBy.length` so the two never drift.
     *
     * @param {string} pinId
     * @param {string} userId
     * @returns {object} the updated pin
     * @throws {Error} if no pin with that id exists
     */
    toggleLike(pinId, userId) {
      const pins = _readArray(KEYS.pins);
      const idx = pins.findIndex((p) => p && p.id === pinId);
      if (idx === -1) {
        throw new Error(`[localAdapter] pin not found: ${pinId}`);
      }
      const pin = { ...pins[idx] };
      const likedBy = Array.isArray(pin.likedBy) ? [...pin.likedBy] : [];
      const i = likedBy.indexOf(userId);
      if (i >= 0) likedBy.splice(i, 1);
      else likedBy.push(userId);
      pin.likedBy = likedBy;
      pin.likeCount = likedBy.length;
      pins[idx] = pin;
      _write(KEYS.pins, pins);
      _broadcast(CHANNELS.pins);
      return pin;
    },
  },

  groups: {
    /**
     * Subscribe to the group list. Same semantics as `pins.list`.
     *
     * @param {(groups: object[]) => void} onChange
     * @returns {() => void} unsubscribe
     */
    list(onChange) {
      const emit = () => onChange(_readArray(KEYS.groups));
      emit();
      return _subscribe(CHANNELS.groups, emit);
    },

    /**
     * Append a new group. Generates `id` and `createdAt`.
     *
     * @param {{ name: string, ownerId: string, ownerName: string }} input
     * @returns {object} the persisted group
     */
    create(group) {
      const groups = _readArray(KEYS.groups);
      const created = {
        id: crypto.randomUUID(),
        name: group.name,
        ownerId: group.ownerId,
        ownerName: group.ownerName,
        createdAt: Date.now(),
      };
      groups.push(created);
      _write(KEYS.groups, groups);
      _broadcast(CHANNELS.groups);
      return created;
    },
  },

  auth: {
    /**
     * @returns {{ uid: string, displayName: string, photoURL: string|null } | null}
     */
    currentUser() {
      try {
        const raw = localStorage.getItem(KEYS.auth);
        if (raw == null) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed.uid !== 'string') {
          console.warn('[localAdapter] auth payload is malformed');
          return null;
        }
        return parsed;
      } catch (err) {
        console.warn('[localAdapter] failed to read auth:', err);
        return null;
      }
    },

    /**
     * Switch to one of the dev users. Phase 2 will replace this with
     * Firebase Auth sign-in.
     *
     * @param {string} userId
     * @returns {{ uid: string, displayName: string, photoURL: string|null }}
     * @throws {Error} if `userId` is not in DEV_USERS
     */
    signIn(userId) {
      const user = DEV_USERS.find((u) => u.uid === userId);
      if (!user) {
        throw new Error(`[localAdapter] unknown dev user: ${userId}`);
      }
      const payload = {
        uid: user.uid,
        displayName: user.displayName,
        photoURL: user.photoURL ?? null,
      };
      _write(KEYS.auth, payload);
      _broadcast(CHANNELS.auth);
      return payload;
    },

    /**
     * Clear the current user and notify subscribers.
     */
    signOut() {
      localStorage.removeItem(KEYS.auth);
      _broadcast(CHANNELS.auth);
    },

    /**
     * Subscribe to auth changes. Emits the current user (or null)
     * immediately, then on every `'auth-changed'` event.
     *
     * @param {(user: ({ uid: string, displayName: string, photoURL: string|null } | null)) => void} cb
     * @returns {() => void} unsubscribe
     */
    onChange(cb) {
      const emit = () => cb(localAdapter.auth.currentUser());
      emit();
      return _subscribe(CHANNELS.auth, emit);
    },
  },
};
