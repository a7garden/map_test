# map_test

Vite + React + MUI로 카카오맵 JavaScript SDK를 테스트하는 프로젝트.

## 시작하기

### 1) 카카오 개발자 콘솔 설정
1. https://developers.kakao.com 로그인
2. **앱 → 제품 설정 → 카카오맵** 활성화
3. **앱 → 앱 설정 → 플랫폼 → Web**에 도메인 등록 (예: `http://localhost:5173`)
4. 발급받은 **JavaScript 키** 복사

### 2) 환경변수 설정
```bash
cp .env.example .env
# .env 파일을 열어 VITE_KAKAO_MAP_KEY 값을 본인의 키로 교체
```

### 3) 실행
```bash
npm install
npm run dev
```

## 카카오맵 SDK 사용 패턴

`index.html`에서 `autoload=false`로 스크립트를 로드하고, React 측에서 `kakao.maps.load()` 콜백으로 SDK 완전 준비를 기다린 뒤 지도를 생성합니다.

```jsx
// src/App.jsx
const { isLoading, error } = useKakaoMap(mapRef, () => ({
  center: new window.kakao.maps.LatLng(33.450701, 126.570667),
  level: 3,
}));
```

`src/hooks/useKakaoMap.js`는 다음을 처리합니다:
- SDK 스크립트 로드 완료 대기
- `kakao.maps.load()` 콜백으로 모듈 준비 확인
- React 19 StrictMode의 dev 더블 마운트 안전 처리
- 에러 상태 노출

## 환경변수

| 변수 | 설명 | 필수 |
|------|------|------|
| `VITE_KAKAO_MAP_KEY` | 카카오맵 JavaScript SDK 키 | ✅ |

`.env`는 `.gitignore`에 의해 커밋되지 않습니다. 팀원에게 공유할 키 형식은 `.env.example`을 참고하세요.

## 보안 주의사항

- 카카오맵 **JavaScript 키**는 클라이언트 노출이 의도된 키입니다 (도메인 기반 제한)
- 단, GitHub 등 공개 저장소에 노출되면 누구나 도용 가능하므로 **반드시 도메인 등록**을 함께 설정
- 키 유출 의심 시 카카오 콘솔에서 즉시 재발급 (Rotate)

---

## React + Vite (원본 README)

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
