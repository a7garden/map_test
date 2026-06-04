/**
 * UUID v4 문자열을 생성한다.
 * `crypto.randomUUID()`가 있으면 사용하고, 없으면 RFC4122 v4 형식의 폴백을 사용한다.
 *
 * @returns {string} 예: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
 */
export function uid() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // RFC4122 v4 fallback
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
