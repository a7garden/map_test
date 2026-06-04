# map_test — 장소 공유 지도

Vite + React 19 + MUI 9 기반 카카오맵 장소 공유 프로젝트.

## 상태

- **Phase 1 (로컬 First) 완료** — 모든 기능이 localStorage로 동작, Firebase 없이 완결
- **Phase 2 예정** — Firebase Auth (Google) + Firestore + Security Rules 마이그레이션

## 주요 기능

- 📍 카카오맵 위에 핀(장소) 생성 / 조회 / 좋아요 / 삭제
- 🔍 카카오 Places API 키워드 검색 → 핀 추가
- 👤 모의 인증 (`DevUserSwitcher`) — Phase 2에서 Google 로그인으로 교체
- 💾 localStorage 영속성 + BroadcastChannel로 탭 간 실시간 동기화
- 📱 모바일 FIRST 레이아웃, 트렌디한 MUI 9 테마 (indigo 액센트 + Pretendard/Inter)

## 시작하기

### 1) 카카오 개발자 콘솔 설정
1. https://developers.kakao.com 로그인
2. **앱 → 제품 설정 → 카카오맵** 활성화
3. **앱 → 앱 설정 → 플랫폼 → Web**에 도메인 등록 (예: `http://localhost:5173`)

> JS 키는 현재 `index.html`에 하드코딩되어 있어 별도 설정 없이 실행됩니다. 운영 배포 시 도메인 등록 + 환경변수 분리를 권장합니다.

### 2) 실행
```bash
npm install
npm run dev
# → http://localhost:5173/
```

### 3) 테스트 시나리오
1. 우측 상단 👤 → **앨리스** 선택
2. 지도 빈 곳 탭 → 새 핀 시트 → 제목/태그 입력 → 저장
3. 핀 탭 → 상세 시트 → ♡ 좋아요
4. 시크릿 창으로 같은 URL → 실시간 반영 확인
5. 🔍 → "강남역" 검색 → 결과 탭 → 자동 핀 생성 시트
6. 새로고침 → 마지막 위치 + 핀들 유지

## 기술 스택

| 영역 | 선택 | 이유 |
|------|------|------|
| 빌드 | Vite 8 | 빠른 HMR, ESM 네이티브 |
| UI | React 19 | 최신 useEffect 패턴, StrictMode dev 더블 마운트 명시 |
| 컴포넌트 | shadcn/ui (Radix + Tailwind) | copy-paste 소유, 트렌디, Vercel 톤 |
| 지도 | 카카오맵 SDK | 한글 POI, Places API |
| 데이터 | localStorage + BroadcastChannel | Phase 1 무서버 / Phase 2에서 어댑터 교체 |
| 인증 | 모의 (`DEV_USERS`) | Phase 1 / Phase 2에서 Firebase Auth |
| 호스팅 | Firebase Hosting (설정만) | `firebase.json`에 public: dist |

## 디렉토리

```
src/
├── App.jsx                              # 메인 state 머신 (시트 라우팅)
├── main.jsx                             # React 부트스트랩
├── index.css                            # Tailwind v4 + 디자인 토큰 (CSS 변수)
├── lib/utils.js                         # cn() 유틸 (shadcn 표준)
├── services/
│   ├── dataAdapter.js                   # 인터페이스 (Phase 1: localStorage)
│   └── localAdapter.js                  # localStorage + BroadcastChannel
├── hooks/
│   ├── useKakaoMap.js                   # SDK 로드 + 지도 생성
│   ├── useAuth.js                       # 모의 인증
│   ├── usePins.js                       # 핀 목록 실시간 구독
│   ├── useSearch.js                     # 카카오 Places 검색
│   └── useColorMode.js                  # 다크/라이트 모드 (system preference)
├── components/
│   ├── ui/                              # shadcn 컴포넌트 (button, input, sheet, dropdown-menu, ...)
│   ├── chrome/{TopBar, Fab}.jsx         # 상단바, FAB
│   ├── auth/DevUserSwitcher.jsx         # Phase 1 모의 유저 전환
│   ├── map/MapView.jsx                  # 마커 + 클릭 핸들러
│   └── sheets/                          # NewPinSheet, PinDetailSheet, PlaceSearchSheet
└── utils/{uid, devUsers, formatDate, lastPosition}.js
```

자세한 아키텍처 결정은 `docs/designs/2026-06-04-place-sharing-design.md` 참고.

## 사용 가능한 스크립트

```bash
npm run dev      # vite 개발 서버
npm run build    # 프로덕션 빌드 (dist/)
npm run preview  # 빌드된 결과 로컬 서빙
npm run lint     # ESLint
```

## 디자인 토큰

`src/index.css`에 CSS 변수로 정의. Tailwind v4의 `@theme inline`으로 자동 매핑.

| 토큰 | light | dark |
|---|---|---|
| `--background` | `#FFFFFF` | `#0A0A0A` |
| `--primary` | `#0070F3` (Vercel blue) | `#3B82F6` (밝게) |
| `--radius` | `0.75rem` (12px) | - |
| `--pin-restaurants` | `#FF6B35` (주황) | - |
| `--pin-cafes` | `#8B4513` (브라운) | - |

다크 모드 토글: TopBar의 달/해 아이콘 클릭. localStorage에 저장, system preference 자동 추적.

## 보안

- 카카오맵 **JavaScript 키**는 도메인 기반 제한 키 — 카카오 콘솔에서 Web 플랫폼에 도메인 등록 필수
- GitHub 공개 저장소에 노출 시 누구나 도용 가능 → 도메인 등록 + 필요 시 키 Rotate
- `firebase deploy`로 호스팅 시 자동 도메인 등록됨 (Firebase 자동 생성 도메인)

## Firebase (Phase 2)

`firebase.json`에 hosting만 설정되어 있음. Firestore/Auth는 Phase 2 작업:
1. 콘솔에서 Firestore + Authentication(Google) 활성화
2. `firebase init`으로 firestore 추가 → `firestore.rules` 작성
3. `src/services/firebaseAdapter.js` 작성 (기존 `localAdapter`와 동일 인터페이스)
4. `src/services/dataAdapter.js`의 import 한 줄만 교체

## Phase 2 데이터 모델 (예정)

```js
// Firestore: pins collection
{
  id: auto,
  lat, lng, title?, description?, tags: string[], groupId?,
  authorId: request.auth.uid,
  authorName, authorPhoto,
  createdAt: serverTimestamp,
  likeCount: number,  // derived from likedBy.length
  likedBy: string[],
}

// Security Rules
match /pins/{pinId} {
  allow read: if true;                                    // 누구나 조회
  allow create: if request.auth != null
                && request.resource.data.authorId == request.auth.uid;
  allow update, delete: if request.auth != null
                        && resource.data.authorId == request.auth.uid;
}
```

## 라이선스 / 크레딧

- 카카오맵 SDK © Kakao Corp.
- MUI © MUI Team (MIT)
- React © Meta (MIT)
