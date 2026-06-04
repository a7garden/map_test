import { createContext, useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Snackbar, Alert } from '@mui/material';
import { useSnackbar } from './useSnackbar';

const DEFAULT_DURATION_MS = 2500;

/**
 * 전역 스낵바 컨텍스트. useSnackbar() 훅으로 showSnackbar(msg, severity) 호출.
 * 같은 메시지가 연속으로 와도 강제로 다시 열리도록 카운터 state로 리마운트.
 */
export function SnackbarProvider({ children, autoHideDuration = DEFAULT_DURATION_MS }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('info');
  const [counter, setCounter] = useState(0);

  const showSnackbar = useCallback((msg, sev = 'info') => {
    setMessage(msg);
    setSeverity(sev);
    setCounter((c) => c + 1);
    setOpen(true);
  }, []);

  const handleClose = (_event, reason) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  };

  const value = useMemo(() => ({ showSnackbar }), [showSnackbar]);

  return (
    <SnackbarContext.Provider value={value}>
      {children}
      <Snackbar
        key={counter}
        open={open}
        autoHideDuration={autoHideDuration}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleClose} severity={severity} variant="filled" sx={{ borderRadius: 2 }}>
          {message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
}

SnackbarProvider.propTypes = {
  children: PropTypes.node,
  autoHideDuration: PropTypes.number,
};

// Context는 같은 파일에 두지 않고 별도 export 위치에서 import (react-refresh 규칙 회피)
const SnackbarContext = createContext(null);

// SnackbarProvider는 위에서 선언됐고, useSnackbar는 별도 파일로 export.
// eslint-disable-next-line react-refresh/only-export-components
export { SnackbarContext, useSnackbar };
