import PropTypes from 'prop-types';
import { Fab as MuiFab } from '@mui/material';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';

export function Fab({ onClick, disabled = false }) {
  return (
    <MuiFab
      variant="extended"
      color="primary"
      onClick={onClick}
      disabled={disabled}
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 1000,
      }}
    >
      <AddLocationAltIcon sx={{ mr: 1 }} />
      핀 추가
    </MuiFab>
  );
}

Fab.propTypes = {
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};
