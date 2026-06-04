import { MapPinPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * 현재 지도 중심에 새 핀 추가하는 FAB.
 * Vercel 스타일: 살짝 그라데이션 + 미묘한 그림자.
 */
export function Fab({ onClick, disabled = false, className }) {
  return (
    <Button
      variant="default"
      size="lg"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'fixed bottom-6 right-6 z-50 h-12 rounded-2xl px-5 shadow-lg shadow-primary/30',
        'bg-gradient-to-br from-primary to-primary/85 hover:shadow-xl hover:shadow-primary/40',
        'transition-all active:scale-95',
        className,
      )}
      aria-label="핀 추가"
    >
      <MapPinPlus className="h-5 w-5" />
      <span className="font-semibold">핀 추가</span>
    </Button>
  );
}
