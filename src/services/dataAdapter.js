import { localAdapter } from './localAdapter';

/**
 * Public data adapter for pins / groups / auth.
 *
 * Phase 1: {@link localAdapter} (localStorage + BroadcastChannel).
 * Phase 2: swap to `firebaseAdapter` (same interface) — one import line.
 *
 * App code MUST go through this object; never import `localAdapter`
 * or touch `localStorage` directly.
 */
export const dataAdapter = {
  pins: {
    /**
     * Subscribe to the pin list. Emits the current list immediately and
     * again on every change (cross-tab in Phase 1, server snapshot in Phase 2).
     *
     * @param {(pins: object[]) => void} onChange
     * @returns {() => void} unsubscribe
     */
    list(onChange) { return localAdapter.pins.list(onChange); },

    /**
     * Append a new pin. Returns the persisted record (with generated id and
     * createdAt).
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
     * }} pin
     * @returns {object}
     */
    create(pin) { return localAdapter.pins.create(pin); },

    /**
     * Merge `patch` into the pin with the given id.
     *
     * @param {string} id
     * @param {object} patch
     * @returns {object} updated pin
     */
    update(id, patch) { return localAdapter.pins.update(id, patch); },

    /**
     * Remove the pin with the given id. Idempotent.
     *
     * @param {string} id
     * @returns {void}
     */
    delete(id) { return localAdapter.pins.delete(id); },

    /**
     * Toggle a like. Keeps `likeCount` and `likedBy` in sync internally.
     *
     * @param {string} pinId
     * @param {string} userId
     * @returns {object} updated pin
     */
    toggleLike(pinId, userId) { return localAdapter.pins.toggleLike(pinId, userId); },
  },

  groups: {
    /**
     * Subscribe to the group list. Emits immediately, then on every change.
     *
     * @param {(groups: object[]) => void} onChange
     * @returns {() => void} unsubscribe
     */
    list(onChange) { return localAdapter.groups.list(onChange); },

    /**
     * Append a new group. Returns the persisted record.
     *
     * @param {{ name: string, ownerId: string, ownerName: string }} group
     * @returns {object}
     */
    create(group) { return localAdapter.groups.create(group); },
  },

  auth: {
    /**
     * Read the current user synchronously.
     *
     * @returns {{ uid: string, displayName: string, photoURL: string|null } | null}
     */
    currentUser() { return localAdapter.auth.currentUser(); },

    /**
     * Sign in as one of the dev users. Phase 2 will accept a Firebase user.
     *
     * @param {string} userId
     * @returns {{ uid: string, displayName: string, photoURL: string|null }}
     */
    signIn(userId) { return localAdapter.auth.signIn(userId); },

    /**
     * Clear the current user.
     *
     * @returns {void}
     */
    signOut() { return localAdapter.auth.signOut(); },

    /**
     * Subscribe to auth changes. Emits the current user (or null) immediately,
     * then on every change.
     *
     * @param {(user: ({ uid: string, displayName: string, photoURL: string|null } | null)) => void} cb
     * @returns {() => void} unsubscribe
     */
    onChange(cb) { return localAdapter.auth.onChange(cb); },
  },
};
