import { useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { useSearch } from '@/hooks/useSearch';

export function PlaceSearchSheet({ open, onClose, onSelect }) {
  const { query, setQuery, results, isSearching, error, clear } = useSearch();
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      clear();
      const t = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [open, clear]);

  const handleSelect = (place) => {
    onSelect(place);
    clear();
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="bottom" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>장소 검색</SheetTitle>
        </SheetHeader>

        <div className="px-5 py-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="장소, 주소 검색"
              className="pl-9 pr-9"
              autoComplete="off"
            />
            {query && (
              <button
                type="button"
                onClick={clear}
                aria-label="검색어 지우기"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="min-h-[200px]">
            {isSearching ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <p className="text-sm text-destructive text-center py-12">검색에 실패했습니다</p>
            ) : !query.trim() ? (
              <p className="text-sm text-muted-foreground text-center py-12">장소를 검색해보세요</p>
            ) : results.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-12">검색 결과가 없습니다</p>
            ) : (
              <ul className="divide-y divide-border">
                {results.map((place) => (
                  <li
                    key={place.id}
                    onClick={() => handleSelect(place)}
                    className="py-3 px-2 -mx-2 rounded-md cursor-pointer hover:bg-accent transition-colors"
                  >
                    <p className="text-sm font-semibold text-foreground">{place.place_name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {place.road_address_name || place.address_name}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
