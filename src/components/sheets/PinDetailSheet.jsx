import { useState } from 'react';
import { Heart, Link as LinkIcon, Trash2, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePins } from '@/hooks/usePins';
import { useAuth } from '@/hooks/useAuth';
import { formatRelative } from '@/utils/formatDate';

const GROUP_NAME_MAP = Object.freeze({
  restaurants: '맛집',
  cafes: '카페',
});

function getGroupName(id) {
  return GROUP_NAME_MAP[id] ?? id;
}

export function PinDetailSheet({ open, onClose, pin, onDeleted }) {
  const { pins, toggleLike, deletePin } = usePins();
  const { currentUser, isAuthenticated } = useAuth();
  const [signInPrompt, setSignInPrompt] = useState(false);

  const livePin = pin ? (pins.find((p) => p.id === pin.id) ?? pin) : null;

  const isAuthor = Boolean(currentUser && livePin && currentUser.uid === livePin.authorId);
  const isLiked = Boolean(currentUser && livePin?.likedBy?.includes(currentUser.uid));

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
      toast.success('링크가 복사되었습니다');
    } catch {
      toast.error('링크 복사에 실패했습니다');
    }
  };

  const handleDelete = () => {
    if (!livePin) return;
    if (!window.confirm('이 핀을 삭제하시겠습니까?')) return;
    deletePin(livePin.id);
    toast.success('핀이 삭제되었습니다');
    onDeleted?.();
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="bottom" className="overflow-y-auto">
        {livePin && (
          <>
            <SheetHeader>
              <SheetTitle>{livePin.title || '제목 없음'}</SheetTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                by {livePin.authorName} · {formatRelative(livePin.createdAt)}
              </p>
            </SheetHeader>

            <div className="px-5 py-4 space-y-4">
              {livePin.description && (
                <p className="text-sm whitespace-pre-wrap text-foreground/90">{livePin.description}</p>
              )}

              {livePin.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {livePin.tags.map((t) => (
                    <Badge key={t} variant="secondary">#{t}</Badge>
                  ))}
                </div>
              )}

              {livePin.groupId && (
                <p className="text-xs text-muted-foreground">그룹: {getGroupName(livePin.groupId)}</p>
              )}

              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant={isLiked ? 'default' : 'outline'}
                  size="sm"
                  onClick={handleLike}
                  className={isLiked ? 'bg-red-500 hover:bg-red-600 text-white' : ''}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{livePin.likeCount ?? 0}</span>
                </Button>
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <LinkIcon className="h-4 w-4" />
                  공유
                </Button>
                {isAuthor && (
                  <Button variant="outline" size="sm" onClick={handleDelete} className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                    삭제
                  </Button>
                )}
              </div>

              {signInPrompt && !isAuthenticated && (
                <p className="text-xs text-destructive">로그인이 필요합니다</p>
              )}

              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {livePin.lat.toFixed(4)}, {livePin.lng.toFixed(4)}
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
