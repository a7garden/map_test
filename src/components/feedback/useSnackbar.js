import { useContext } from 'react';
import { SnackbarContext } from './SnackbarProvider';

/**
 * SnackbarProvider 내부에서 사용. showSnackbar(message, severity) 반환.
 * @returns {{ showSnackbar: (message: string, severity?: 'success'|'info'|'warning'|'error') => void }}
 */
export function useSnackbar() {
  const ctx = useContext(SnackbarContext);
  if (!ctx) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return ctx;
}
