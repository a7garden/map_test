import { useEffect, useState } from 'react';

const STORAGE_KEY = 'app:colorMode:v1';

/**
 * 다크/라이트 모드. system 기본값을 따르며 사용자가 토글 가능.
 * .dark 클래스를 <html>에 붙여 Tailwind v4의 @custom-variant dark 활성화.
 */
export function useColorMode() {
  const [mode, setMode] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (mode === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  // 시스템 설정 변경 추적 (저장된 값 없을 때만)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setMode(e.matches ? 'dark' : 'light');
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const toggle = () => setMode((m) => (m === 'dark' ? 'light' : 'dark'));

  return { mode, isDark: mode === 'dark', toggle, setMode };
}
