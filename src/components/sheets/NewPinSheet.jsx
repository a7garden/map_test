import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Chip,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import { usePins } from '../../hooks/usePins';
import { BottomSheet } from './BottomSheet';

const MAX_TAGS = 8;
const MAX_TAG_LENGTH = 20;

// Phase 1 기본 그룹 (그룹 관리 화면 미구현)
const DEFAULT_GROUPS = [
  { id: 'restaurants', name: '맛집' },
  { id: 'cafes', name: '카페' },
];

function TagInput({ value, onChange, max = MAX_TAGS, maxTagLength = MAX_TAG_LENGTH }) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const clearError = () => setError('');

  const tryAdd = (raw) => {
    const tag = raw.trim().slice(0, maxTagLength);
    if (!tag) return false;
    if (value.includes(tag)) { setInput(''); clearError(); return false; }
    if (value.length >= max) { setError(`태그는 최대 ${max}개까지 추가할 수 있어요`); return false; }
    onChange([...value, tag]);
    setInput(''); clearError();
    return true;
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); tryAdd(input); return; }
    if (e.key === 'Backspace' && input === '' && value.length > 0) {
      onChange(value.slice(0, -1)); clearError();
    }
  };

  return (
    <Box>
      <TextField
        value={input}
        onChange={(e) => { setInput(e.target.value); clearError(); }}
        onKeyDown={handleKeyDown}
        placeholder="태그 입력 후 Enter"
        size="small" fullWidth
        disabled={value.length >= max}
        inputProps={{ maxLength: maxTagLength }}
      />
      {value.length > 0 && (
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
          {value.map((tag) => (
            <Chip key={tag} label={tag} size="small" onDelete={() => { onChange(value.filter((t) => t !== tag)); clearError(); }} />
          ))}
        </Stack>
      )}
      {error && <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>{error}</Typography>}
    </Box>
  );
}
TagInput.propTypes = {
  value: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
  max: PropTypes.number,
  maxTagLength: PropTypes.number,
};

function NewPinForm({ lat, lng, onClose, onSaved }) {
  const { currentUser } = useAuth();
  const { createPin } = usePins();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState([]);
  const [groupId, setGroupId] = useState('');

  const handleSave = () => {
    if (!currentUser) return;
    const newPin = createPin({
      lat, lng,
      title: title.trim() || undefined,
      description: description.trim() || undefined,
      tags,
      groupId: groupId || undefined,
      authorId: currentUser.uid,
      authorName: currentUser.displayName,
      authorPhoto: currentUser.photoURL ?? null,
    });
    onSaved?.(newPin);
    onClose();
  };

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="caption" color="text.secondary" component="div">위치</Typography>
        <Typography variant="body2" sx={{ mt: 0.25 }}>📍 {lat.toFixed(4)}, {lng.toFixed(4)}</Typography>
        <Typography variant="caption" color="text.secondary">지도를 움직여 위치 조정</Typography>
      </Box>
      <TextField label="제목 (선택)" placeholder="예: 성산일출봉 카페"
        value={title} onChange={(e) => setTitle(e.target.value)}
        fullWidth size="small" />
      <TextField label="설명 (선택)" placeholder="이 장소에 대한 메모"
        value={description} onChange={(e) => setDescription(e.target.value)}
        multiline rows={3} fullWidth size="small" />
      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>태그</Typography>
        <TagInput value={tags} onChange={setTags} />
      </Box>
      <TextField select label="그룹 (선택)" value={groupId}
        onChange={(e) => setGroupId(e.target.value)} fullWidth size="small">
        <MenuItem value="">없음</MenuItem>
        {DEFAULT_GROUPS.map((g) => <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>)}
      </TextField>
      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
        <Button onClick={onClose}>취소</Button>
        <Button variant="contained" onClick={handleSave} disabled={!currentUser}>저장</Button>
      </Box>
    </Stack>
  );
}
NewPinForm.propTypes = {
  lat: PropTypes.number.isRequired,
  lng: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
  onSaved: PropTypes.func,
};

function SignInPrompt({ onClose }) {
  return (
    <Stack spacing={2} alignItems="center" sx={{ py: 3 }}>
      <Typography variant="body1">Google 로그인이 필요합니다</Typography>
      <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
        (Phase 1에서는 DevUserSwitcher로 유저를 선택하세요)
      </Typography>
      <Button onClick={onClose} variant="outlined">닫기</Button>
    </Stack>
  );
}
SignInPrompt.propTypes = { onClose: PropTypes.func.isRequired };

export function NewPinSheet({ open, onClose, lat, lng, onSaved }) {
  const { isAuthenticated } = useAuth();
  return (
    <BottomSheet open={open} onClose={onClose} title="새 핀">
      {isAuthenticated ? (
        // key 전이(open↔closed)로 폼을 리마운트 → 상태가 자연 초기화
        <NewPinForm key={open ? 'open' : 'closed'} lat={lat} lng={lng} onClose={onClose} onSaved={onSaved} />
      ) : (
        <SignInPrompt onClose={onClose} />
      )}
    </BottomSheet>
  );
}
NewPinSheet.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  lat: PropTypes.number.isRequired,
  lng: PropTypes.number.isRequired,
  onSaved: PropTypes.func,
};
