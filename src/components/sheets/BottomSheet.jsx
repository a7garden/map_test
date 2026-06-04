import PropTypes from 'prop-types';
import { Box, Drawer, IconButton, Stack, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

/**
 * MUI Drawer를 감싼 바텀시트. 헤더(title + 닫기 버튼)와 스크롤 가능한 본문으로
 * 구성된다. NewPinSheet·PinDetailSheet 등에서 공통으로 사용한다.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {import('react').ReactNode} [props.title]
 * @param {import('react').ReactNode} [props.children]
 */
export function BottomSheet({ open, onClose, title, children }) {
  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
          },
        },
      }}
    >
      {title && (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            px: 2,
            py: 1.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="h6">{title}</Typography>
          <IconButton onClick={onClose} size="small" aria-label="닫기">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      )}
      <Box sx={{ p: 2, overflowY: 'auto', flex: 1 }}>{children}</Box>
    </Drawer>
  );
}

BottomSheet.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.node,
  children: PropTypes.node,
};
