import { Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';

/**
 * 모의 유저 전환 메뉴 (Phase 1 전용).
 */
export function DevUserSwitcher({ open, onOpenChange }) {
  const { currentUser, devUsers, signIn } = useAuth();

  const handleSelect = (uid) => {
    signIn(uid);
    onOpenChange(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-64"
      >
        <DropdownMenuLabel>
          {currentUser ? '현재 사용자' : '로그인이 필요합니다'}
        </DropdownMenuLabel>
        {currentUser && (
          <div className="px-3 py-2 text-sm font-semibold text-foreground">
            {currentUser.displayName}
          </div>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuLabel>유저 전환</DropdownMenuLabel>
        {devUsers.map((u) => (
          <DropdownMenuItem
            key={u.uid}
            onClick={() => handleSelect(u.uid)}
            className="cursor-pointer"
          >
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                {u.displayName[0]}
              </AvatarFallback>
            </Avatar>
            <span className="flex-1">{u.displayName}</span>
            {currentUser?.uid === u.uid && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <div className="px-3 py-2 text-[10px] text-muted-foreground">
          Phase 1 전용 · Firebase 로그인은 Phase 2
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
