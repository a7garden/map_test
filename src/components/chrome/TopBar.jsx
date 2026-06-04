import { Search, Moon, Sun, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useColorMode } from '@/hooks/useColorMode';
import { cn } from '@/lib/utils';

/**
 * 상단 앱바 — 글래스 배경 + 검색/테마/프로필 아이콘.
 */
export function TopBar({ onSearchClick, onProfileClick, className }) {
  const { currentUser } = useAuth();
  const { isDark, toggle: toggleColorMode } = useColorMode();

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full h-14 glass border-b',
        'flex items-center justify-between px-3',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-base font-bold tracking-tight">
          <span className="text-primary">📍</span> 핀플
        </span>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onSearchClick}
          aria-label="검색"
          className="rounded-full"
        >
          <Search className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleColorMode}
          aria-label="테마 전환"
          className="rounded-full"
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onProfileClick}
          aria-label="프로필"
          className="rounded-full"
        >
          {currentUser ? (
            <Avatar className="h-8 w-8">
              {currentUser.photoURL && <AvatarImage src={currentUser.photoURL} alt={currentUser.displayName} />}
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                {currentUser.displayName?.[0] ?? '?'}
              </AvatarFallback>
            </Avatar>
          ) : (
            <UserCircle className="h-6 w-6" />
          )}
        </Button>
      </div>
    </header>
  );
}
