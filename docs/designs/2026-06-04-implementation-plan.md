# 장소 공유 프로젝트 — 구현 계획 (Phase 1)

## 디자인 요약
- 모바일 FIRST, 트렌디한 미니멀 디자인
- 데이터 어댑터 패턴 (localStorage → Firebase 교체 가능)
- MUI 9 테마 전면 커스터마이징
- 카카오 Places API 검색

## 배치 구성

각 배치는 병렬 가능하면 `subagent` parallel mode로, 의존성 있으면 sequential로 실행.

### Batch 1: Foundation (병렬 3개)
- **T1.1** `src/theme/theme.js` — MUI 테마 (indigo 액센트, 둥근 모서리, Pretendard+Inter)
- **T1.2** `src/services/dataAdapter.js` + `src/services/localAdapter.js` — 어댑터 인터페이스 + localStorage 구현 (BroadcastChannel로 탭 간 동기화)
- **T1.3** `src/utils/uid.js` + `src/utils/devUsers.js` — uuid 생성, 모의 유저 3명 정의

### Batch 2: Hooks (병렬 3개, Batch 1 의존)
- **T2.1** `src/hooks/useAuth.js` — 현재 유저, 전환, 로그아웃 (어댑터 통해)
- **T2.2** `src/hooks/usePins.js` — 핀 목록 실시간 구독 (BroadcastChannel)
- **T2.3** `src/hooks/useSearch.js` — Kakao Places API Promise 래퍼

### Batch 3: UI Chrome (병렬 3개, Batch 2 의존)
- **T3.1** `src/components/chrome/TopBar.jsx` — 로고, 검색 버튼, 프로필 메뉴
- **T3.2** `src/components/chrome/Fab.jsx` — 현재 중심에 핀 추가
- **T3.3** `src/components/auth/DevUserSwitcher.jsx` — 가짜 유저 전환 메뉴

### Batch 4: Sheets (병렬 3개, Batch 2 의존)
- **T4.1** `src/components/sheets/NewPinSheet.jsx` — 새 핀 생성 (제목/설명/태그/그룹)
- **T4.2** `src/components/sheets/PinDetailSheet.jsx` — 핀 상세 (좋아요/공유/삭제)
- **T4.3** `src/components/sheets/PlaceSearchSheet.jsx` — 카카오 장소 검색
- **T4.4** `src/components/sheets/BottomSheet.jsx` — 공통 Drawer 래퍼 (드래그 핸들, 모서리 둥글게)

### Batch 5: Map + App (sequential 2개, Batch 3·4 의존)
- **T5.1** `src/components/map/MapView.jsx` — useKakaoMap 확장, 커스텀 마커(SVG), 클릭 핸들러
- **T5.2** `src/App.jsx` — 모든 것을 조립: TopBar + MapView + FAB + 시트 라우팅 + 사용자 컨텍스트

### Batch 6: 마무리 (sequential 1개)
- **T6.1** Snackbar 시스템, 에러/성공 알림
- **T6.2** `index.html` title/메타 정리
- **T6.3** 기본 그룹 2-3개 시드 (맛집/카페/공원 예시)
- **T6.4** 마지막 지도 위치 localStorage 저장

## 검증

- ESLint 통과
- Vite build 성공
- 수동 체크리스트:
  - [ ] 핀 생성 → 새로고침 → 유지
  - [ ] 두 탭에서 동시 변경 → 양쪽 반영
  - [ ] 검색 → 결과 탭 → 핀 생성 좌표 자동
  - [ ] 좋아요 → 새로고침 → 유지
  - [ ] 모의 유저 전환 → 작성자 표시 변경
  - [ ] 모바일 뷰포트(375px)에서 FAB/시트 정상
  - [ ] 본인 핀만 삭제 버튼 노출

## 범위 외 (Phase 2)
- Firebase Auth/Firestore
- 사진 첨부
- 필터 (UI는 공간 확보만, 동작은 생략)
- 클러스터링 (50개 이하 테스트이므로 보류)

## 위험 요소 & 대응
- **Kakao Clusterer** 미테스트 → 기본 마커 렌더링으로 시작, 필요 시 추가
- **MUI Drawer 드래그** 기본 제공 안 함 → 헤더 드래그 핸들만 시각적으로, 풀 드래그는 Phase 2
- **BroadcastChannel** 미지원 브라우저 → localStorage 'storage' 이벤트로 fallback
