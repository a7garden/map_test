# AGENTS.md — AI 에이전트용 온보딩

## 정체성

Vite + React 19 + MUI 9 + 카카오맵 SDK로 만든 **장소 공유 지도** 프로젝트. Phase 1은 localStorage로 완결, Phase 2에서 Firebase로 마이그레이션 예정.

## 빠른 사실

| 항목 | 값 |
|------|-----|
| 빌드 | Vite 8 |
| UI | React 19 (StrictMode dev 더블 마운트 주의) |
| 컴포넌트 | shadcn/ui (Radix + Tailwind v4) — 우리 코드에 소유 |
| 스타일 | Tailwind v4 (CSS 변수 + @theme inline) |
| 아이콘 | lucide-react |
| 지도 | 카카오맵 SDK (autoload=false) |
| 데이터 | localStorage + BroadcastChannel |
| 인증 | 모의 (`DEV_USERS` 3명) — Phase 2에서 Firebase Auth |
| 호스팅 | Firebase Hosting (설정만) |

## 작업 디렉토리

```
/Volumes/MERCURY/PROJECTS/map_test
```

원격: `origin` (a7garden/map_test), `upstream` (dongglzang/map_test). 사용자 fork는 `origin`.

## 디렉토리 (역할 포함)

```
src/
├── App.jsx                              # 최상위 state 머신. 시트/메뉴 라우팅
├── main.jsx                             # React 부트스트랩
├── index.css                            # Tailwind v4 + 디자인 토큰
├── lib/utils.js                         # cn() 유틸
├── services/
│   ├── dataAdapter.js                   # ⚠️ 외부 노출 인터페이스. Phase 2에서 import 1줄 교체
│   └── localAdapter.js                  # localStorage + BroadcastChannel 구현
├── hooks/
│   ├── useKakaoMap.js                   # SDK 로드 + 지도 인스턴스
│   ├── useAuth.js                       # currentUser, signIn, signOut, devUsers
│   ├── usePins.js                       # pins 배열 + create/update/delete/toggleLike
│   ├── useSearch.js                     # 카카오 Places 검색 (300ms 디바운스)
│   └── useColorMode.js                  # 다크/라이트 (system preference + localStorage)
├── components/
│   ├── ui/                              # shadcn 컴포넌트 (소유). 추가 시 npx shadcn@latest add <name>
│   ├── chrome/{TopBar, Fab}.jsx         # 전역 UI. 비즈니스 로직 없음
│   ├── auth/DevUserSwitcher.jsx         # Phase 1 전용. Phase 2에서 제거
│   ├── map/MapView.jsx                  # useKakaoMap + kakao.maps.Marker
│   └── sheets/                          # NewPinSheet, PinDetailSheet, PlaceSearchSheet
└── utils/{uid, devUsers, formatDate, lastPosition}.js
```

`docs/designs/2026-06-04-place-sharing-design.md` — 결정된 디자인 (참고용).  
`docs/designs/2026-06-04-implementation-plan.md` — 구현 단계 기록.

## 아키텍처 핵심

### 데이터 어댑터 패턴

`dataAdapter`는 단일 진입점. 컴포넌트/훅은 이 인터페이스만 호출:

```js
dataAdapter.pins.list(onChange)         // 실시간 구독
dataAdapter.pins.create(pin)
dataAdapter.pins.update(id, patch)
dataAdapter.pins.delete(id)
dataAdapter.pins.toggleLike(pinId, uid)
dataAdapter.auth.{currentUser, signIn, signOut, onChange}
```

**Phase 2 작업 시**: `firebaseAdapter.js`를 같은 인터페이스로 작성 → `dataAdapter.js`의 import 1줄 교체. **컴포넌트/훅은 건드리지 않음**.

### 훅 패턴

- 훅은 `dataAdapter`만 호출 (localStorage 직접 접근 ❌)
- 실시간 구독은 effect 안에서, cleanup으로 unsubscribe
- React 19 strict mode dev 더블 마운트 안전하게 (effect 내부에 `let cancelled = false` 클로저 사용)

### 시트 패턴

`BottomSheet` (MUI Drawer 래퍼) 위에서 시트별 컴포넌트가 폼/상세를 그림. `open`, `onClose`, `title`, `children`만 받음. 백드롭 클릭으로 닫힘 (모바일 UX).

## 핀 데이터 형태

```js
{
  id: string,
  lat: number, lng: number,
  title?: string, description?: string,
  tags: string[],                    // 자유 라벨
  groupId?: string,                  // Phase 1: 'restaurants' | 'cafes' 하드코딩
  authorId: string, authorName: string, authorPhoto?: string,
  createdAt: number,                 // Date.now()
  likeCount: number,                 // 항상 likedBy.length와 동기화
  likedBy: string[],                 // userId[] — 중복방지/취소용
}
```

`likeCount`는 호출자가 직접 설정 ❌ — `toggleLike` 내부에서 `likedBy.length`로 동기화.

## 명령

```bash
npm run dev                          # http://localhost:5173
npm run build                        # dist/
npm run preview                      # 빌드 결과 서빙 (포트 4173)
npm run lint                         # ESLint (react-hooks/* 규칙 엄격)
```

## Phase 1 vs Phase 2 — 절대 어기지 말 것

| 작업 | OK | ❌ |
|------|----|----|
| 컴포넌트에 localStorage 직접 접근 | | ❌ 어댑터 통해서만 |
| 새 그룹 관리 UI 추가 | | ❌ Phase 1은 하드코딩 (맛집/카페) |
| Firebase SDK import | | ❌ Phase 1 무서버 |
| 사진 첨부 | | ❌ Firebase Storage 필요 |
| 다국어 | | ❌ 한국어만 |
| DevUserSwitcher 제거 | | ❌ Phase 1 핵심. Phase 2에서 교체 |
| 키 환경변수 분리 | 가능 | 하드코딩도 OK (현재 상태) |

## React 19 함정 (자주 걸림)

### `react-hooks/set-state-in-effect`
effect 본문에서 직접 setState ❌. "조건부 리셋" 패턴은 render에서 derive:
```js
// ❌
useEffect(() => {
  if (!query) { setResults([]); setError(null); }
}, [query]);

// ✅ render에서 derive
const displayResults = query.trim() ? results : [];
const displayError = query.trim() ? error : null;
```

### `react-hooks/refs`
render 중 `ref.current` 읽기/쓰기 ❌. latest-ref 패턴:
```js
const ref = useRef(value);
useEffect(() => { ref.current = value; });
```

### `react-refresh/only-export-components`
한 파일에 컴포넌트 + 훅 export ❌. 분리:
```js
// SnackbarProvider.jsx (컴포넌트만)
// useSnackbar.js (훅만)
```

## shadcn/ui 사용 패턴

- shadcn은 **복사-소유** 라이브러리. 컴포넌트는 `src/components/ui/`에 있고 우리 코드
- 새 컴포넌트 추가: `npx shadcn@latest add <component>` (components.json이 alias 설정 보유)
- `cn()` 헬퍼는 `@/lib/utils`에서 import
- 토큰은 `src/index.css`의 CSS 변수 → `bg-background`, `text-primary` 같은 Tailwind 클래스로 자동 사용

## MUI에서 마이그레이션 시 참조

| MUI | shadcn/Tailwind |
|----|----|
| `<Box>`, `<Stack>`, `<Typography>` | `<div>`, Tailwind `flex`, `gap-*`, `text-*` |
| `sx={{ ... }}` | `className="..."` |
| `<Drawer anchor="bottom">` | `<Sheet side="bottom">` |
| `<Snackbar>` + `Alert` | `sonner` `toast()` + `<Toaster />` |
| `<Menu>` + `<MenuItem>` | `<DropdownMenu>` + `<DropdownMenuItem>` |
| `<TextField>` | `<Input>` / `<Textarea>` + `<Label>` |
| `<Chip>` | `<Badge>` |
| `<Avatar>` | `<Avatar>` + `<AvatarFallback>` (shadcn/Radix) |

## 카카오맵 SDK 함정

- **마커 클릭**: `kakao.maps.Marker`는 `kakao.maps.event.addListener(marker, 'click', ...)` 지원. `CustomOverlay`는 직접 DOM onclick 필요 — Phase 1에서는 Marker 사용으로 단순화
- **autoload=false**: SDK 준비 완료를 `kakao.maps.load(callback)`으로 확인 후 사용
- **도메인 등록**: 콘솔에 미등록 도메인에서 호출 시 403

## 새 기능 추가 시 체크리스트

### 새 시트 추가
1. `src/components/sheets/MySheet.jsx` 생성
2. `BottomSheet`로 감싸기
3. props: `{ open, onClose, ...sheet-specific }`
4. `App.jsx`에 state + 렌더 + 핸들러 추가
5. propTypes 작성

### 새 데이터 필드 추가
1. `localAdapter.js`의 `_readArray` 검증 + `create`/`update` 허용 필드 확인
2. `dataAdapter.js`의 JSDoc 업데이트
3. 관련 시트/MapView 마커 표시 업데이트
4. Phase 2 마이그레이션 시: `firebaseAdapter.js`도 동일 필드 지원

### 새 훅 추가
1. `src/hooks/useXxx.js`
2. 데이터 접근은 반드시 `dataAdapter` 통해서
3. React 19 strict mode 안전성 (effect 안 `cancelled` 클로저)
4. `npx eslint src/hooks/` 통과 확인

## 보안

- 카카오맵 JS 키는 **하드코딩** (`index.html`). 도메인 등록이 1차 방어선
- 키 노출 시: 콘솔 → 키 재발급 (Rotate) + 도메인 재등록
- `.env`는 만들어두었지만 현재는 미사용. Phase 2에서 Firebase 설정 시 활용 예정

## 절대 변경하지 말 것

- `dataAdapter`의 인터페이스 (Phase 2 마이그레이션 핵심)
- `services/localAdapter.js`의 storage 키 (`pins:v1`, `groups:v1`, `auth:currentUser:v1`) — 사용자 데이터 손실 방지
- `index.css`의 primary Vercel blue (`#0070F3`) — 디자인 정체성
- `components/ui/`에 있는 shadcn 컴포넌트는 직접 수정보다 재추천 (`npx shadcn@latest add ...`) 우선

## 참고 문서

- `README.md` — 사용자/기여자용. 시작 가이드, 기능 설명
- `docs/designs/2026-06-04-place-sharing-design.md` — 디자인 결정, 데이터 모델, UI 흐름
- `docs/designs/2026-06-04-implementation-plan.md` — 구현 단계 기록
- 카카오맵 SDK: https://apis.map.kakao.com/web/
- MUI 9: https://mui.com/material-ui/
