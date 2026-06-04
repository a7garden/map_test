import PropTypes from 'prop-types';
import {
  Avatar,
  Box,
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { useAuth } from '../../hooks/useAuth';

// Phase 1 전용 — Phase 2(Firebase Auth)에서 제거될 개발자용 사용자 전환 메뉴.
export function DevUserSwitcher({ anchorEl, open, onClose }) {
  const { currentUser, signIn, devUsers } = useAuth();

  const handleSelect = (uid) => () => {
    signIn(uid);
    onClose();
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { minWidth: 240 } } }}
    >
      <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
        {currentUser ? (
          <>
            <Typography variant="caption" color="text.secondary">현재 사용자</Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {currentUser.displayName}
            </Typography>
          </>
        ) : (
          <Typography variant="caption" color="text.secondary">
            로그인이 필요합니다
          </Typography>
        )}
      </Box>
      {devUsers.map((u) => {
        const isCurrent = currentUser?.uid === u.uid;
        return (
          <MenuItem key={u.uid} selected={isCurrent} onClick={handleSelect(u.uid)}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.main', fontSize: 14 }}>
                {u.displayName[0]}
              </Avatar>
            </ListItemIcon>
            <ListItemText>{u.displayName}</ListItemText>
            {isCurrent && (
              <ListItemIcon sx={{ justifyContent: 'flex-end', minWidth: 32 }}>
                <CheckIcon fontSize="small" color="primary" />
              </ListItemIcon>
            )}
          </MenuItem>
        );
      })}
      <Divider />
      <Box sx={{ px: 2, py: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Phase 1 전용 · Firebase 로그인은 Phase 2
        </Typography>
      </Box>
    </Menu>
  );
}

DevUserSwitcher.propTypes = {
  anchorEl: PropTypes.object,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
