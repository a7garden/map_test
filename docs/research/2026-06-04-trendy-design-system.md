# 트렌디한 디자인 시스템 조사 (2026-06)

## 요약 (TL;DR)

**우리 앱에 권장하는 방향**: MUI 9를 유지하되, **비주얼 토큰을 Vercel/Linear 스타일로 재작성** + **다크 모드 추가** + **글래스모피즘 시트**. 1-2일 작업으로 큰 시각적 임팩트를 만들 수 있음.

라이브러리 교체(shadcn/ui, Mantine 등)는 1-2주 작업이며 ROI가 낮음. 우리 앱은 이미 잘 동작하므로 **비주얼 레이어만 트렌디하게** 만드는 게 합리적.

---

## 1. React UI 라이브러리 2026 트렌드

| 라이브러리 | npm 주간 다운로드 (2026) | 컴포넌트 수 | 스타일링 | 트렌디 점수 | 비고 |
|---|---|---|---|---|---|
| **shadcn/ui** | ~2.5M | ~50 (copy-paste) | Tailwind | ⭐⭐⭐⭐⭐ | 2024-2026 가장 인기. Radix 기반. 코드 소유권 |
| **Mantine 8** | ~800K | 100+ | CSS-in-JS (emotion) | ⭐⭐⭐⭐ | 배터리 포함, 후크 포함, 차트/Stepper 내장 |
| **MUI 9** | ~5M | 100+ | emotion | ⭐⭐⭐ | 견고하지만 "뻔한" 느낌. Material 3 |
| **Chakra UI 3** | ~500K | 80+ | emotion | ⭐⭐⭐ | 현대적이지만 커뮤니티 감소 추세 |
| **HeroUI (NextUI)** | ~200K | 50+ | Tailwind | ⭐⭐⭐⭐ | Framer Motion 내장, 모션 중심 |
| **Radix UI Primitives** | ~1.5M | 35 (headless) | - | - | shadcn의 토대 |

### 라이브러리 교체 비용 추정 (우리 앱 기준)

| 옵션 | 작업량 | 효과 |
|---|---|---|
| **MUI 유지 + 재테마** | 1-2일 | ⭐⭐⭐⭐ (큰 시각적 변화) |
| **Mantine으로 교체** | 1주 | ⭐⭐⭐⭐ (큰 변화, 그러나 MUI와 비슷한 인상) |
| **shadcn/ui로 교체** | 2주+ | ⭐⭐⭐⭐⭐ (가장 트렌디, 그러나 23개 컴포넌트 재작성) |

**판단**: 우리 앱은 이미 동작 + 데이터 어댑터 패턴으로 잘 격리되어 있음. 가장 ROI 높은 선택은 **MUI 유지 + 비주얼 재작성**.

출처:
- [ShadCN UI vs Mantine: 2026 Comparison — BSWEN](https://docs.bswen.com/blog/2026-03-22-shadcn-vs-mantine-comparison/)
- [Best React Component Libraries 2026 — DesignRevision](https://designrevision.com/blog/best-react-component-libraries)
- [14 Best React UI Component Libraries 2026 — Untitled UI](https://www.untitledui.com/blog/react-component-libraries)

---

## 2. 2026 비주얼 디자인 트렌드

### 2.1 핵심 트렌드

1. **글래스모피즘 부활** — Apple이 macOS/iOS에 "Liquid Glass" 효과 도입 → 3rd-party 앱들도 채택 중
2. **다크 모드는 기본값** — 80%+ 사용자가 선호, OLED 배터리 63% 절약
3. **바텀 네비게이션** — 3-5개 주요 목적지 (FAB보다 우선)
4. **마이크로 인터랙션** — 기능을 위한 모션, 단순 장식이 아님
5. **적응형 UI** — 시간/위치/맥락에 따라 인터페이스 자체가 변형
6. **AI 개인화** — 예측 인터페이스 (Netflix/Spotify 모델)

### 2.2 Vercel/Linear 스타일 (가장 영향력 있음)

이 두 회사가 2025-2026 웹 디자인 톤을 사실상 정함:

**Vercel 디자인 시스템** ([seedflip 분석](https://seedflip.co/blog/vercel-design-system)):

```css
:root {
  /* 순 흑백 - 브랜드 컬러 없음 */
  --background: #000000;
  --foreground: #FFFFFF;

  /* 그레이 램프가 모든 일을 함 */
  --gray-100: #F7F7F7;
  --gray-200: #E5E5E5;
  --gray-300: #D4D4D4;
  --gray-400: #A3A3A3;
  --gray-500: #737373;
  --gray-600: #525252;
  --gray-700: #404040;
  --gray-800: #262626;
  --gray-900: #171717;
  --gray-950: #0A0A0A;

  /* 액센트: 최소화 */
  --blue: #0070F3;  /* 링크, primary 버튼, active 상태에만 */

  /* 폰트: Geist Sans + Geist Mono (자체 제작) */
  --font-sans: 'Geist', -apple-system, system-ui, sans-serif;
  --text-xs/sm/base/lg/xl/2xl/3xl: 12/14/16/18/24/32/48px;
  --leading-tight: 1.15;
  --tracking-tight: -0.04em;  /* 타이트한 자간 */

  /* 모서리: 거의 직각 */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  /* (마케팅 페이지는 0px도 사용) */

  /* 보더: 거의 안 보임 */
  --border-default: 1px solid rgba(255, 255, 255, 0.08);
}
```

**핵심 원칙**:
- 그래디언트 ❌ (마케팅 배경의 미묘한 fade만)
- 그림자 ❌ (마케팅), 다크 대시보드는 최소
- 일러스트 ❌
- 장식용 컬러 ❌ (의미가 있을 때만 색 사용)
- **"비싼 느낌" = "없는 것들의 효과"**

### 2.3 모바일에서 적용 가능한 부분

- ✅ Vercel 스타일: **라운드 12-16px는 OK** (Vercel 대시보드는 lg/md 사용). 마케팅 페이지의 0-4px는 모바일 앱과 안 어울림
- ✅ 글래스모피즘: 시트(sheet)에 적용 → 2026 메인스트림
- ✅ 다크 모드: 1차 시민
- ✅ 마이크로 인터랙션: 좋아요 누를 때 하트 펄스, 핀 탭 시 살짝 튀어오름
- ✅ 카테고리별 핀 색상: 핀플이 맛집/카페를 이미 지원하니 시각적 구분 추가

출처:
- [13 Mobile App UI/UX Design Trends for 2026 — DesignStudioUIUX](https://www.designstudiouiux.com/blog/mobile-app-ui-ux-design-trends/)
- [9 Mobile App Design Trends for 2026 — UXPilot](https://uxpilot.ai/blogs/mobile-app-design-trends)
- [Vercel Design System Breakdown — SeedFlip](https://seedflip.co/blog/vercel-design-system)

---

## 3. 폰트 트렌드 2026

### 한글
- **Pretendard**: 여전히 디팩토 표준. 공공용 Pretendard GOV 별도 존재
- 대안: Spoqa Han Sans Neo, IBM Plex Sans KR, Noto Sans KR
- **권장**: Pretendard 유지 (이미 사용 중, 검증됨)

### 라틴
- **Inter**: 안정적 선택 (Vercel 이전 표준)
- **Geist**: 2023년 Vercel 출시, 2026년 부상. 단 한글 미지원
- **Sora**: 헤드라인용으로 인기
- **권장**: Inter 유지 (Geist는 한글 매칭이 약함)

결론: **Pretendard + Inter** 조합이 가장 검증되고 트렌디. 변경 불필요.

출처:
- [Pretendard GitHub](https://github.com/orioncactus/pretendard)
- [Geist Design System — Vercel](https://vercel.com/geist/introduction)

---

## 4. 지도 앱 디자인 영감 (Mapstr, Google Maps 2024+)

### Mapstr (가장 가까운 레퍼런스)
- 핀별 색상 (카테고리별)
- 태그를 컬러 칩으로
- 핀에 코멘트/노트 첨부
- 협업 맵 (친구와 공유)
- 프라이빗/퍼블릭 전환
- 현재 위치 근처 알림

### Google Maps 2024 리디자인
- 둥근 카드 (radius 16px+)
- 다크 모드 일관성 (지도도 다크)
- 바텀 시트가 표준
- 마이크로 인터랙션

### 우리 앱에 적용할 점
1. **카테고리별 핀 색상** — 맛집(주황), 카페(브라운), 기타(현재 indigo)
2. **태그 칩에 색상** — 시각적 풍부함
3. **다크 지도 모드** — kakao map은 자체 다크모드 있음
4. **마이크로 인터랙션** — 좋아요 하트 펄스, 핀 탭 시 살짝 튀어오름

출처:
- [Mapstr 공식 사이트](https://en.mapstr.com/)
- [What are the Key Mobile App UI/UX Design Trends for 2026? — Elinext](https://www.elinext.com/services/ui-ux-design/trends/key-mobile-app-ui-ux-design-trends/)

---

## 5. 우리 앱을 위한 구체적 추천

### 5.1 1순위: 비주얼 토큰 재작성 (1-2일)

**현재** → **변경 후**:
| 항목 | 현재 | 변경 후 | 이유 |
|---|---|---|---|
| Primary | `#3D5AFE` (indigo) | `#0070F3` (Vercel blue) | 더 차분하고 "expensive" 느낌 |
| Background | `#FAFAFA` | `#FFFFFF` (light) / `#0A0A0A` (dark) | Vercel 톤 |
| Border radius | 12-16 | 12-16 (유지) | 모바일에 맞음 |
| Shadow | `0 2px 8px rgba(0,0,0,0.06)` | 더 미묘하게: `0 1px 3px rgba(0,0,0,0.04)` | Vercel 스타일 |
| AppBar | translucent + blur | 유지, 단 더 진한 blur (16px) | 글래스모피즘 강화 |
| BottomSheet | flat white | **글래스 (rgba + blur 20px)** | 2026 트렌드 |
| 다크 모드 | 없음 | **추가** (system preference 추적) | 2026 table stakes |
| FAB | flat indigo | **subtle gradient** (linear 135deg indigo→blue) | 약간의 깊이감 |
| Pin | 단색 indigo | 카테고리별 색상 + 미묘한 그림자 | 정보 풍부화 |

### 5.2 2순위: 카테고리 색상 + 다크 지도 (0.5일)

- 맛집 핀: 주황/레드 (`#FF6B35`)
- 카페 핀: 브라운 (`#8B4513`)
- 관광/기타: 현재 indigo (`#0070F3`)
- Kakao Maps 자체 다크 모드 토글 추가 (지도 우측 상단)

### 5.3 3순위: 마이크로 인터랙션 (0.5일)

- 좋아요 하트: 클릭 시 1.3배 스케일 → 1.0 (200ms)
- 핀 탭: 1.0 → 1.1 → 1.0 (150ms) + 핀 색 살짝 밝아짐
- 새 핀 생성: 시트 슬라이드 업 + 동시에 맵 살짝 어두워짐 (dim 30%)

### 5.4 절대 하지 말 것

- 라이브러리 교체 ❌ (작업량 대비 효과 낮음)
- 일러스트 추가 ❌ (Vercel 스타일: screenshots, geometric shapes만)
- 그래디언트 남용 ❌ (액션 한 곳 정도만)
- 큰 모서리 (24px+) ❌ (Vercel과 어긋남)

---

## 6. 작업 순서 (1.5일 계획)

1. **다크 모드 인프라** (3시간)
   - `theme.js`에 dark palette 추가
   - `useColorMode` 훅 (system preference 추적, localStorage 저장)
   - `ThemeProvider`를 컨텍스트로 전환
2. **비주얼 토큰 재작성** (2시간)
   - primary, gray ramp, border, shadow, radius 조정
3. **글래스모피즘 시트** (2시간)
   - `BottomSheet` paper 스타일을 translucent + blur로
   - 단, dark/light 양쪽에서 잘 보이도록 대비
4. **카테고리 핀 색상** (1시간)
   - `MapView`의 `PIN_SVG`를 카테고리별로 동적 생성
5. **다크 지도 토글** (1시간)
   - kakao map의 setMapTypeId 활용
6. **마이크로 인터랙션** (2시간)
   - FAB 클릭, 좋아요, 핀 탭
7. **테스트/검증** (1시간)
   - 빌드, 린트, 모바일 뷰포트 확인

---

## 7. 출처 정리

- [ShadCN UI vs Mantine: 2026 Comparison — BSWEN](https://docs.bswen.com/blog/2026-03-22-shadcn-vs-mantine-comparison/)
- [Best React Component Libraries 2026 — DesignRevision](https://designrevision.com/blog/best-react-component-libraries)
- [14 Best React UI Component Libraries 2026 — Untitled UI](https://www.untitledui.com/blog/react-component-libraries)
- [13 Mobile App UI/UX Design Trends for 2026 — DesignStudioUIUX](https://www.designstudiouiux.com/blog/mobile-app-ui-ux-design-trends/)
- [9 Mobile App Design Trends for 2026 — UXPilot](https://uxpilot.ai/blogs/mobile-app-design-trends)
- [Vercel Design System Breakdown — SeedFlip](https://seedflip.co/blog/vercel-design-system)
- [Geist Design System — Vercel](https://vercel.com/geist/introduction)
- [Mapstr 공식 사이트](https://en.mapstr.com/)
- [Pretendard GitHub](https://github.com/orioncactus/pretendard)
- [Key Mobile App UI/UX Design Trends for 2026 — Elinext](https://www.elinext.com/services/ui-ux-design/trends/key-mobile-app-ui-ux-design-trends/)
- [Mobile App Color Schemes: 2026 Design Trends — ColorUXLab](https://coloruxlab.com/guides/mobile-app-color-design)
- [How to Design Dark Mode for Your Mobile App 2026 — Appinventiv](https://appinventiv.com/blog/guide-on-designing-dark-mode-for-mobile-app/)
