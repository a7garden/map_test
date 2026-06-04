import PropTypes from 'prop-types';
import { useState } from 'react';
import {
  Box,
  Stack,
  Typography,
  Chip,
  Button,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LinkIcon from '@mui/icons-material/Link';
import DeleteIcon from '@mui/icons-material/Delete';
import { BottomSheet } from './BottomSheet';
import { usePins } from '../../hooks/usePins';
import { useAuth } from '../../hooks/useAuth';
import { formatRelative } from '../../utils/formatDate';

// Phase 1: hardcoded group id → display name. Phase 2 will read from
// the groups collection via a hook.
const GROUP_NAME_MAP = Object.freeze({
  restaurants: '맛집',
  cafes: '카페',
});

function getGroupName(id) {
  return GROUP_NAME_MAP[id] ?? id;
}

/**
 * 핀 상세 바텀시트. 선택된 핀의 메타데이터를 보여주고
 * 좋아요/공유/삭제 액션을 노출한다. 같은 시트 안에서 핀이 교체될 수
 * 있으므로 매 렌더마다 `pins` 배열에서 id로 최신 버전을 다시 찾는다.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {(object|null)} props.pin 표시할 핀 (없으면 null)
 * @param {(() => void)=} props.onDeleted 삭제 성공 후 호출되는 선택적 콜백
 */
export function PinDetailSheet({ open, onClose, pin, onDeleted }) {
  const { pins, toggleLike, deletePin } = usePins();
  const { currentUser, isAuthenticated } = useAuth();
  const [signInPrompt, setSignInPrompt] = useState(false);

  // props.pin은 시트가 열려 있는 동안 다른 마커 클릭 등으로 교체될 수 있다.
  // 외부에서 들어온 참조와 usePins이 들고 있는 최신 핀 중 가장 최신을
  // 사용하기 위해 매 렌더마다 id로 다시 찾는다.
  const livePin = pin ? (pins.find((p) => p.id === pin.id) ?? pin) : null;

  const isAuthor = Boolean(
    currentUser && livePin && currentUser.uid === livePin.authorId,
  );
  const isLiked = Boolean(
    currentUser && livePin?.likedBy?.includes(currentUser.uid),
  );

  const handleLike = () => {
    if (!isAuthenticated || !livePin || !currentUser) {
      setSignInPrompt(true);
      return;
    }
    setSignInPrompt(false);
    toggleLike(livePin.id, currentUser.uid);
  };

  const handleShare = async () => {
    if (!livePin) return;
    const url = `${window.location.href}?pin=${livePin.id}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch (err) {
      console.warn('[PinDetailSheet] clipboard write failed:', err);
    }
  };

  const handleDelete = () => {
    if (!livePin) return;
    if (!window.confirm('이 핀을 삭제하시겠습니까?')) return;
    deletePin(livePin.id);
    onDeleted?.();
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose}>
      {livePin && (
        <Stack spacing={2}>
          <Box>
            <Typography variant="h6">
              {livePin.title || '제목 없음'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              by {livePin.authorName} · {formatRelative(livePin.createdAt)}
            </Typography>
          </Box>

          {livePin.description && (
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {livePin.description}
            </Typography>
          )}

          {livePin.tags?.length > 0 && (
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {livePin.tags.map((tag) => (
                <Chip key={tag} label={`#${tag}`} size="small" />
              ))}
            </Box>
          )}

          {livePin.groupId && (
            <Typography variant="caption" color="text.secondary">
              그룹: {getGroupName(livePin.groupId)}
            </Typography>
          )}

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button
              startIcon={isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              onClick={handleLike}
              color={isLiked ? 'error' : 'primary'}
            >
              {livePin.likeCount ?? 0}
            </Button>
            <Button
              startIcon={<LinkIcon />}
              onClick={handleShare}
            >
              공유
            </Button>
            {isAuthor && (
              <Button
                startIcon={<DeleteIcon />}
                color="error"
                onClick={handleDelete}
              >
                삭제
              </Button>
            )}
          </Box>

          {signInPrompt && !isAuthenticated && (
            <Typography variant="caption" color="error">
              로그인이 필요합니다
            </Typography>
          )}

          <Typography variant="caption" color="text.secondary">
            📍 {livePin.lat.toFixed(4)}, {livePin.lng.toFixed(4)}
          </Typography>
        </Stack>
      )}
    </BottomSheet>
  );
}

PinDetailSheet.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  pin: PropTypes.shape({
    id: PropTypes.string,
    lat: PropTypes.number,
    lng: PropTypes.number,
    title: PropTypes.string,
    description: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    groupId: PropTypes.string,
    authorId: PropTypes.string,
    authorName: PropTypes.string,
    authorPhoto: PropTypes.string,
    createdAt: PropTypes.number,
    likeCount: PropTypes.number,
    likedBy: PropTypes.arrayOf(PropTypes.string),
  }),
  onDeleted: PropTypes.func,
};
