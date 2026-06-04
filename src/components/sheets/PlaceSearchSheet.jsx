import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  CircularProgress,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { BottomSheet } from './BottomSheet';
import { useSearch } from '../../hooks/useSearch';

export function PlaceSearchSheet({ open, onClose, onSelect }) {
  const { query, setQuery, results, isSearching, error, clear } = useSearch();
  const inputRef = useRef(null);

  // 시트가 열릴 때 이전 검색 상태를 비우고 입력에 포커스
  useEffect(() => {
    if (!open) return;
    clear();
    const t = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(t);
  }, [open, clear]);

  const handleSelect = (place) => {
    onSelect(place);
    clear();
    onClose();
  };

  const showInitial = !query.trim();
  const showEmpty = !showInitial && !isSearching && !error && results.length === 0;

  return (
    <BottomSheet open={open} onClose={onClose} title="장소 검색">
      <TextField
        inputRef={inputRef}
        fullWidth
        autoFocus
        placeholder="장소, 주소 검색"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: query ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={clear} aria-label="검색어 지우기">
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
          },
        }}
      />

      <Box sx={{ mt: 2, minHeight: 200 }}>
        {isSearching ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : error ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography color="error">검색에 실패했습니다</Typography>
            <Typography variant="caption" color="text.secondary">
              잠시 후 다시 시도해 주세요
            </Typography>
          </Box>
        ) : showInitial ? (
          <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
            장소를 검색해보세요
          </Typography>
        ) : showEmpty ? (
          <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
            검색 결과가 없습니다
          </Typography>
        ) : (
          <List disablePadding>
            {results.map((place) => (
              <ListItem key={place.id} disablePadding divider>
                <ListItemButton onClick={() => handleSelect(place)}>
                  <ListItemText
                    primary={place.place_name}
                    secondary={place.road_address_name || place.address_name}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </BottomSheet>
  );
}

PlaceSearchSheet.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
};
