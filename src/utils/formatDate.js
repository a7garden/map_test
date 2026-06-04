/**
 * `Date.now()`로 받은 타임스탬프(ms)를 한국어 상대 시각 문자열로 변환한다.
 *  - 1분 미만: "방금 전"
 *  - 1시간 미만: "N분 전"
 *  - 1일 미만  : "N시간 전"
 *  - 30일 미만 : "N일 전"
 *  - 그 외      : "YYYY.MM.DD" 절대 시각
 *
 * @param {number} ts 변환할 타임스탬프 (밀리초)
 * @returns {string} 한국어 상대/절대 시각 문자열
 */
export function formatRelative(ts) {
  const now = Date.now();
  const diff = now - ts;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return '방금 전';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}일 전`;
  const d = new Date(ts);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd}`;
}
