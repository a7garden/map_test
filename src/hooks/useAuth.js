import { useEffect, useState } from 'react';
import { dataAdapter } from '../services/dataAdapter';
import { DEV_USERS } from '../utils/devUsers';

/**
 * 현재 인증 사용자를 추적하는 React 훅.
 *
 * dataAdapter.auth의 얇은 래퍼. Phase 1은 localStorage 기반 localAdapter를,
 * Phase 2에서는 Firebase Auth 어댑터로 교체되며, 이 훅의 시그니처와
 * 반환값은 그대로 유지된다(구현만 교체).
 *
 * React 19 StrictMode의 dev 더블 마운트에도 안전하도록:
 *  - 구독은 useEffect 안에서만 수행하고 cleanup으로 해제한다.
 *  - onChange 콜백은 functional setState로 직전 값을 읽어 비교하므로
 *    stale closure 문제가 없다.
 *  - 동일한 사용자 객체로 setState가 호출되면 이전 참조를 그대로 반환해
 *    React의 bailout으로 불필요한 리렌더를 막는다.
 *
 * @returns {{
 *   currentUser: ({ uid: string, displayName: string, photoURL: string|null } | null),
 *   signIn: (userId: string) => void,
 *   signOut: () => void,
 *   isAuthenticated: boolean,
 *   devUsers: ReadonlyArray<{ uid: string, displayName: string, photoURL: string|null }>,
 * }}
 */
export function useAuth() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    return dataAdapter.auth.onChange((user) => {
      setCurrentUser((prev) =>
        prev?.uid === user?.uid &&
        prev?.displayName === user?.displayName &&
        (prev?.photoURL ?? null) === (user?.photoURL ?? null)
          ? prev
          : user,
      );
    });
  }, []);

  return {
    currentUser,
    signIn: (userId) => { dataAdapter.auth.signIn(userId); },
    signOut: () => { dataAdapter.auth.signOut(); },
    isAuthenticated: currentUser !== null,
    devUsers: DEV_USERS,
  };
}
