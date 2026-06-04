import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { usePins } from '@/hooks/usePins';

const MAX_TAGS = 8;
const MAX_TAG_LENGTH = 20;
const DEFAULT_GROUPS = [
  { id: 'restaurants', name: '맛집' },
  { id: 'cafes', name: '카페' },
];

function TagInput({ value, onChange, max = MAX_TAGS, maxTagLength = MAX_TAG_LENGTH }) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const tryAdd = (raw) => {
    const tag = raw.trim().slice(0, maxTagLength);
    if (!tag) return false;
    if (value.includes(tag)) { setInput(''); setError(''); return false; }
    if (value.length >= max) { setError(`태그는 최대 ${max}개까지 추가할 수 있어요`); return false; }
    onChange([...value, tag]);
    setInput(''); setError('');
    return true;
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); tryAdd(input); return; }
    if (e.key === 'Backspace' && input === '' && value.length > 0) {
      onChange(value.slice(0, -1)); setError('');
    }
  };

  return (
    <div>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => { setInput(e.target.value); setError(''); }}
          onKeyDown={handleKeyDown}
          placeholder="태그 입력 후 Enter"
          maxLength={maxTagLength}
          disabled={value.length >= max}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => tryAdd(input)}
          disabled={value.length >= max}
          aria-label="태그 추가"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {value.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="cursor-pointer"
              onClick={() => onChange(value.filter((t) => t !== tag))}
            >
              {tag}
              <X className="ml-1 h-3 w-3" />
            </Badge>
          ))}
        </div>
      )}
      {error && <p className="text-xs text-destructive mt-1.5">{error}</p>}
    </div>
  );
}

function NewPinForm({ lat, lng, onClose, onSaved }) {
  const { currentUser } = useAuth();
  const { createPin } = usePins();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState([]);
  const [groupId, setGroupId] = useState('');

  const handleSave = () => {
    if (!currentUser) return;
    createPin({
      lat, lng,
      title: title.trim() || undefined,
      description: description.trim() || undefined,
      tags,
      groupId: groupId || undefined,
      authorId: currentUser.uid,
      authorName: currentUser.displayName,
      authorPhoto: currentUser.photoURL ?? null,
    });
    onSaved?.();
    onClose();
  };

  return (
    <div className="px-5 py-4 space-y-4">
      <div>
        <p className="text-xs text-muted-foreground">위치</p>
        <p className="text-sm font-medium mt-0.5">📍 {lat.toFixed(4)}, {lng.toFixed(4)}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">지도를 움직여 위치 조정</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="title">제목 <span className="text-muted-foreground font-normal">(선택)</span></Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 성산일출봉 카페"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="desc">설명 <span className="text-muted-foreground font-normal">(선택)</span></Label>
        <Textarea
          id="desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="이 장소에 대한 메모"
          rows={3}
        />
      </div>

      <div className="space-y-1.5">
        <Label>태그 <span className="text-muted-foreground font-normal">(선택)</span></Label>
        <TagInput value={tags} onChange={setTags} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="group">그룹 <span className="text-muted-foreground font-normal">(선택)</span></Label>
        <select
          id="group"
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">없음</option>
          {DEFAULT_GROUPS.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <Button variant="ghost" onClick={onClose}>취소</Button>
        <Button onClick={handleSave} disabled={!currentUser}>저장</Button>
      </div>
    </div>
  );
}

function SignInPrompt({ onClose }) {
  return (
    <div className="px-5 py-8 flex flex-col items-center gap-3">
      <p className="text-base">Google 로그인이 필요합니다</p>
      <p className="text-xs text-muted-foreground text-center">
        (Phase 1에서는 DevUserSwitcher로 유저를 선택하세요)
      </p>
      <Button variant="outline" onClick={onClose} className="mt-2">닫기</Button>
    </div>
  );
}

export function NewPinSheet({ open, onClose, lat, lng, onSaved }) {
  const { isAuthenticated } = useAuth();
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="bottom" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>새 핀</SheetTitle>
          <SheetClose className="absolute right-3 top-3 rounded-sm opacity-70 hover:opacity-100">
            <X className="h-4 w-4" />
          </SheetClose>
        </SheetHeader>
        {isAuthenticated ? (
          <NewPinForm key={open ? 'open' : 'closed'} lat={lat} lng={lng} onClose={onClose} onSaved={onSaved} />
        ) : (
          <SignInPrompt onClose={onClose} />
        )}
      </SheetContent>
    </Sheet>
  );
}
