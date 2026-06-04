# 장소 공유 프로젝트 — 디자인 문서

- **작성일**: 2026-06-04
- **상태**: Draft (검토 대기)
- **범위**: Phase 1 (로컬 First) — Firebase 연동은 Phase 2

---

## 1. 목표 & 비범위

### 목표
- Google 로그인한 사용자가 **지도에 핀**을 찍어 장소를 공유
- 누구나(비로그인 포함) 핀을 **조회** 가능
- 로그인 사용자는 핀에 **좋아요** 가능 (1인 1회, 취소 가능)
- **장소 검색**으로 빠르게 위치 잡고 핀 추가
- 모바일 사용성 최우선, PC는 부가 지원

### 비범위 (Phase 1)
- 사진 첨부 (Storage 필요)
- 댓글 / 리뷰
- 친구 / 팔로우
- 실시간 협업
- 푸시 알림
- 다국어

---

## 2. 디자인 톤

**트렌디 + 미니멀 + 모바일 친화**

- **컬러**: 무채색 베이스 + 단일 액센트 (인디고/블루)
  - 배경: 거의 흰색(`#FAFAFA`) / 다크모드 차분한 회색
  - 액센트: `#3D5AFE` (MUI indigo 계열, 과하지 않게)
  - 위험/좋아요: `#FF4D6D` (따뜻한 핑크-레드)
- **타이포**: 시스템 폰트 + Pretendard (한글), Inter (라틴). 본문 15–16px, 메타 13px
- **모양**: 둥근 모서리(12–16px), 얕은 그림자, 글래스모피즘은 **사용 안 함** (촌스러워 보일 수 있음)
- **간격**: 8px 그리드, 여유 있는 패딩
- **모션**: 200–300ms ease-out, 화면 전환은 슬라이드
- **아이콘**: Material Symbols Rounded (MUI 기본과 호환)

> MUI 9를 유지하되, `theme`을 전면 커스터마이징해서 위 톤을 구현. `borderRadius`, `elevation` 낮추고, `fontFamily` 교체.

---

## 3. 아키텍처

### 디렉토리 구조
```
src/
├── main.jsx
├── App.jsx
├── theme/
│   └── theme.js              # MUI 테마
├── services/
│   ├── dataAdapter.js        # 인터페이스 정의
│   ├── localAdapter.js       # localStorage 기반 (Phase 1)
│   └── firebaseAdapter.js    # (Phase 2)
├── hooks/
│   ├── useKakaoMap.js        # (기존)
│   ├── useAuth.js            # 현재 로그인 사용자
│   ├── usePins.js            # 핀 목록 실시간 구독
│   └── useSearch.js          # 카카오 장소 검색
├── components/
│   ├── map/
│   │   ├── MapView.jsx       # 지도 + 마커 + 클러스터
│   │   ├── PinMarker.jsx
│   │   └── MapControls.jsx   # 줌, 내 위치
│   ├── sheets/
│   │   ├── PinDetailSheet.jsx  # 핀 상세 (좋아요, 공유)
│   │   ├── NewPinSheet.jsx     # 새 핀 생성
│   │   └── PlaceSearchSheet.jsx
│   ├── chrome/
│   │   ├── TopBar.jsx        # 로고, 검색 버튼
│   │   └── ProfileMenu.jsx   # 로그인/사용자 메뉴
│   └── auth/
│       └── DevUserSwitcher.jsx  # 로컬 전용: 가짜 유저 전환
└── utils/
    └── kakaoLoader.js        # SDK 동적 로더
```

### 데이터 어댑터 패턴
Firebase를 나중에 붙이기 위해 **인터페이스 → 구현** 분리:

```js
// dataAdapter.js
export const dataAdapter = {
  pins: {
    list(onChange) { ... },           // 실시간 구독 콜백
    create(pin) { ... },
    update(id, patch) { ... },
    delete(id) { ... },
    toggleLike(pinId, userId) { ... }, // 좋아요/취소 토글
  },
  groups: {
    list(onChange) { ... },
    create(group) { ... },
  },
  auth: {
    currentUser() { ... },
    signIn() { ... },
    signOut() { ... },
  },
};
```

- **Phase 1**: `localAdapter.js`가 localStorage + BroadcastChannel(`'pins-changed'`)로 실시간 흉내
- **Phase 2**: `firebaseAdapter.js`가 Firestore `onSnapshot` + Firebase Auth로 교체
- `App.jsx`는 어댑터 인터페이스만 알면 됨 → 마이그레이션 시 import 한 줄만 교체

---

## 4. 데이터 모델

### `Pin`
```js
{
  id: string,                // uuid (로컬) / Firestore auto-id
  lat: number,
  lng: number,
  title?: string,            // 선택 (없으면 작성자명 + 시간만 표시)
  description?: string,      // 선택
  tags: string[],            // 선택, 자유 라벨
  groupId?: string,          // 선택
  authorId: string,
  authorName: string,
  authorPhoto?: string,
  createdAt: number,         // Date.now()
  likeCount: number,         // 0..n
  likedBy: string[],         // userId[] — 좋아요한 사람 목록 (unlike/중복방지)
}
```

### `Group`
```js
{
  id: string,
  name: string,              // "2024 제주 여행"
  ownerId: string,
  ownerName: string,
  createdAt: number,
}
```

### `User` (Phase 1: 모킹)
```js
// dev user switcher로 전환 가능
[
  { uid: 'u_alice', displayName: '앨리스', photoURL: null },
  { uid: 'u_bob',   displayName: '밥',   photoURL: null },
  { uid: 'u_carol', displayName: '캐롤', photoURL: null },
]
```

Phase 2에서 Firebase Auth (Google) 도입. Firestore `users/{uid}` doc에 추가 정보 저장.

---

## 5. UI 흐름 (모바일 FIRST)

### 메인 화면
```
┌─────────────────────────────┐
│ 🗺  핀플       🔍  👤       │  ← TopBar (반투명, blur)
├─────────────────────────────┤
│                             │
│        [지도]               │
│       ●  ●                  │  ← 마커 (커스텀 핀 모양)
│           ●  ●●             │
│                             │
│              ┌──────┐       │
│              │ +    │       │  ← FAB: 현재 지도 중심에 핀 추가
│              └──────┘       │
└─────────────────────────────┘
```

- **TopBar**: 반투명 배경 + backdrop-filter blur (모던하지만, 글래스모피즘의 진한 형태는 피함)
- **FAB**: 그라데이션 없는 단색 indigo, 클릭 시 NewPinSheet 열림 (현재 중심 좌표 기준)
- **지도 탭**: 빈 곳을 길게 누르면 → "여기에 핀 추가" 작은 토스트 → 탭하면 NewPinSheet

### 검색 화면 (TopBar 🔍)
```
┌─────────────────────────────┐
│ ← 🔍  ____________________  │  ← 검색 입력
├─────────────────────────────┤
│ 📍  카카오 본사              │
│     제주특별자치도 제주시...  │
├─────────────────────────────┤
│ 📍  카카오테크 캠퍼스         │
│     경기 성남시...           │
└─────────────────────────────┘
```
- 카카오 Places API (`kakao.maps.services.Places.keywordSearch`) 사용
- 결과 탭하면 그 위치로 지도 이동 + 자동으로 NewPinSheet 열림

### 핀 상세 (BottomSheet)
```
┌─────────────────────────────┐
│ ─── (drag handle)            │
│                             │
│ 성산일출봉 카페 ☕            │  ← title
│ by 앨리스 · 2시간 전          │
│                             │
│ 오션뷰 좋은 숨은 카페.        │  ← description
│                             │
│ #카페 #오션뷰 #제주          │  ← tags (칩)
│                             │
│  ♡ 12   🔗 공유   🗑 삭제   │  ← 좋아요/공유/내 핀일 때만 삭제
│                             │
│ [그룹: 2024 제주 여행 ▼]     │  ← 그룹 선택/변경
└─────────────────────────────┘
```
- 높이는 내용에 따라 30% / 60% / 90% 스냅
- 좋아요 누르면 즉시 카운트 반영, 하트 애니메이션
- 본인 핀이면 삭제 버튼 노출, 누르면 confirm → 삭제

### 새 핀 (BottomSheet)
```
┌─────────────────────────────┐
│ 새 핀                        │
│                             │
│ 📍 33.4507, 126.5707        │  ← 좌표 (탭하면 지도에서 위치 미세조정)
│                             │
│ 제목 (선택)                  │
│ [____________________]      │
│                             │
│ 설명 (선택)                  │
│ [____________________]      │
│ [____________________]      │
│                             │
│ 태그 (선택)                  │
│ [#카페] [#오션뷰] [+ 추가]  │
│                             │
│ 그룹 (선택)                  │
│ [없음 ▼]                    │
│                             │
│             [ 취소 ] [ 저장 ]│
└─────────────────────────────┘
```

### PC 레이아웃
- TopBar는 동일
- 지도는 더 크게 (가로폭 활용)
- 핀 상세/새 핀은 **우측 사이드 패널** (모바일 bottom sheet의 PC 대응)
- 검색은 TopBar 인라인 input

---

## 6. 기능 명세 (Phase 1)

### F1. 지도 표시
- Kakao Map SDK, `autoload=false` + `kakao.maps.load()`
- 초기 중심: 마지막 위치 (localStorage) 또는 기본값
- 마커는 **커스텀 오버레이** (핀 모양 SVG)
- 50개 이상이면 `clusterer` 라이브러리로 묶음 표시 (이미 SDK에 로드됨)

### F2. 핀 생성
- 진입점 2가지: 지도 빈 곳 탭 / FAB
- 좌표 → NewPinSheet → 저장
- 저장 시 localStorage에 push, `pins-changed` 이벤트 broadcast

### F3. 핀 조회
- 앱 시작 시 `dataAdapter.pins.list`로 로드
- 다른 탭/창에서 변경 시 BroadcastChannel로 실시간 반영
- 핀 탭 → PinDetailSheet

### F4. 장소 검색
- TopBar 🔍 → PlaceSearchSheet (전체 화면 시트)
- Kakao Places API (`kakao.maps.services.Places`)
- 결과 탭 → 지도 이동 + NewPinSheet 자동 오픈 (좌표 미리 채움)

### F5. 좋아요
- PinDetailSheet의 ♡ 버튼
- `dataAdapter.pins.toggleLike(pinId, uid)` 호출
- `likedBy` 배열에 uid 있으면 제거 / 없으면 추가
- `likeCount`는 `likedBy.length`로 동기화
- 비로그인 상태에서 누르면 → "Google 로그인이 필요합니다" 토스트 (Phase 1에서는 "DevUserSwitcher로 유저를 선택하세요" 안내)

### F6. 모의 인증 (Phase 1 전용)
- TopBar 👤 → 메뉴: 현재 유저 / "유저 전환 (dev)"
- 유저 전환: 3명 중 선택 → 즉시 반영
- 로그아웃: 현재 Phase 1에서는 별도 동작 없음 (다음 유저 선택)

### F7. 필터 (Phase 1 후반)
- TopBar에 필터 아이콘 → BottomSheet
- 태그 / 그룹 / 작성자로 필터
- 다중 선택

---

## 7. 권한 & 보안 (Phase 2 미리보기)

### Firestore Rules
```
match /pins/{pinId} {
  allow read: if true;                              // 누구나 조회
  allow create: if request.auth != null
                && request.resource.data.authorId == request.auth.uid;
  allow update, delete: if request.auth != null
                        && resource.data.authorId == request.auth.uid;
  // 좋아요 토글은 별도 subcollection으로 관리할 수도 있음 (Phase 2에서 결정)
}
```

### Auth
- Google Sign-In (Popup)
- 신규 유저는 `users/{uid}` doc 자동 생성 (Cloud Function 또는 클라이언트)

---

## 8. 에러 처리

| 상황 | 처리 |
|------|------|
| 카카오 SDK 로드 실패 | 에러 Alert + 재시도 버튼 |
| localStorage quota 초과 | 가장 오래된 핀 10개 삭제 후 재시도 (Phase 1) |
| 검색 결과 0건 | "결과가 없습니다" 빈 상태 UI |
| 본인 아닌 핀 삭제 시도 | UI에서 노출 안 함 (이중 안전) |
| 동시 수정 | localStorage는 last-write-wins (Phase 1 한계) |

---

## 9. 테스트 전략

### Phase 1
- 수동 E2E: 핀 생성 → 새로고침 → 유지 확인 / 좋아요 → 새로고침 → 유지 확인
- BroadcastChannel: 두 탭 열어 동시 변경 확인

### Phase 2
- Firestore emulator로 규칙 테스트
- Firebase Test SDK

---

## 10. 구현 순서 (제안)

1. **테마 + 레이아웃** — MUI theme 커스터마이징, TopBar/FAB 스켈레톤
2. **데이터 어댑터 인터페이스 + localStorage 구현** — 마이그레이션 준비
3. **마커 + 클러스터 + 핀 목록 표시**
4. **NewPinSheet** — FAB/지도 탭으로 핀 생성
5. **PinDetailSheet** — 표시/좋아요/삭제
6. **장소 검색** — Places API 통합
7. **DevUserSwitcher** — 모의 인증
8. **필터** — 태그/그룹/작성자
9. (Phase 2) **Firebase 연동** — 어댑터 교체, Auth, Rules

---

## 11. 열린 결정사항

- [ ] **사진**: 완전 제외? (사용자 확인됨 — 일단 제외)
- [ ] **삭제 정책**: 본인만? 아니면 관리자도? (제안: 본인만)
- [ ] **그룹 공개 범위**: 모두에게 공개? 비공개 그룹 가능? (제안: 모두 공개, 비공개는 Phase 3)
- [ ] **지도 초기 위치**: 사용자 현재 위치? 기본값? (제안: localStorage의 마지막 위치 → 기본값 fallback)
- [ ] **마커 커스텀 디자인**: 기본 핀 vs. 카테고리별 색상? (제안: 일단 단색, 카테고리 도입 시 색상)

---

## 다음 단계

이 문서를 검토하시고:
- 디자인 톤 / 레이아웃이 의도한 방향인지
- 11번의 열린 결정사항 답변
- 빠진 기능 / 과한 기능이 있는지

확인 후 `autonomous-loop` 스킬로 구현을 진행합니다.
