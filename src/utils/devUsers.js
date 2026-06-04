/**
 * Phase 1 로컬 개발 전용 목 사용자 목록.
 * Firebase Auth 연동(Phase 2) 전까지 localAdapter에서 import해 사용한다.
 * 실제 인증/권한과 무관하므로 프로덕션 빌드에 노출되어서는 안 된다.
 *
 * @type {ReadonlyArray<{uid: string, displayName: string, photoURL: string|null}>}
 */
export const DEV_USERS = [
  { uid: 'u_alice', displayName: '앨리스', photoURL: null },
  { uid: 'u_bob', displayName: '밥', photoURL: null },
  { uid: 'u_carol', displayName: '캐롤', photoURL: null },
];
