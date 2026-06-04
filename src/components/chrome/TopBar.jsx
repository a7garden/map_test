import PropTypes from 'prop-types';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  IconButton,
  Avatar,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useAuth } from '../../hooks/useAuth';

/**
 * 상단 chrome 바. 비즈니스 로직 없이 검색/프로필 콜백만 노출한다.
 *
 * @param {object} props
 * @param {() => void} props.onSearchClick
 * @param {() => void} props.onProfileClick
 */
export function TopBar({ onSearchClick, onProfileClick }) {
  const { currentUser } = useAuth();

  const initial =
    currentUser?.displayName?.[0] ?? '';

  return (
    <AppBar position="static" sx={{ height: 56 }}>
      <Toolbar
        sx={{ minHeight: '56px !important', display: 'flex', justifyContent: 'space-between', px: 1 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
            📍 핀플
          </Typography>
        </Box>
        <Box>
          <IconButton onClick={onSearchClick} aria-label="검색" edge="end">
            <SearchIcon />
          </IconButton>
          <IconButton onClick={onProfileClick} aria-label="프로필" edge="end">
            {currentUser ? (
              <Avatar
                src={currentUser.photoURL ?? undefined}
                alt={currentUser.displayName}
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: 'primary.main',
                  color: 'common.white',
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                {initial}
              </Avatar>
            ) : (
              <AccountCircleIcon />
            )}
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

TopBar.propTypes = {
  onSearchClick: PropTypes.func.isRequired,
  onProfileClick: PropTypes.func.isRequired,
};
