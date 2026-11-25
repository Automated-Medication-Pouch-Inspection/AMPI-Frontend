# Medilux Frontend

약품 검수 B2B 웹앱을 위한 **프런트엔드 전용 개발 시작 프로젝트**입니다.
React + TypeScript + Vite + React Router + Ant Design을 사용합니다.
서버·데이터베이스·AI 모델·장비 제어 코드는 포함하지 않습니다.

## 진행 상황 (2026-11-25 기준)

| 단계 | 내용 | 상태 |
| --- | --- | --- |
| 준비 | 프로젝트 뼈대, 가상 검수 목록·상세 | 완료 |
| 준비 | S-03·S-04·S-05 화면 흐름·상태 규칙·패키지 계획 | 완료 → [계획 문서](docs/plan-s03-s05.md) |
| 준비 | 1단계 착수 전 팀 결정 4건(검수 ID, 저장 버튼, 저장 후 복귀, 직접 접속 복귀) | 확정 → [결정 기록](docs/decisions.md) D-001~D-004 |
| 1단계 | 가상 데이터로 S-03 미확인 건 선택 → S-04 판정 저장 → 이전 화면 복귀 → 미확인 건수 갱신 | **다음 작업** |
| 2단계 | S-05 검수 이력 필터·페이지·URL 복원 | 대기 |
| 3단계 이후 | 장비·장애 상태, 이상 알림, 재판정, 인증, 설정·통계, 운영자 콘솔 | 서버 계약·팀 결정 후 |

코드는 아직 뼈대 상태입니다. 위 계획 중 1단계 이후는 구현되지 않았습니다.

## 처음 합류했다면 이 순서로 읽기

1. 이 README: 실행 방법과 진행 상황
2. [docs/frontend-guide.md](docs/frontend-guide.md): 코드 작성 기준
3. [docs/decisions.md](docs/decisions.md): 확정·예정 결정과 이유(D-001~D-010)
4. [docs/plan-s03-s05.md](docs/plan-s03-s05.md): 화면별 점검표, 진입·복귀 경로, 상태표, 파일 계획, 1단계 완료 조건
5. [SaaS_command1.md](SaaS_command1.md): UI 리뷰 체크리스트(접근성·포커스·폼·URL 상태)

결정을 바꿀 때는 `docs/decisions.md`의 기존 항목을 지우지 않고 새 항목을 추가합니다.

## 근거 자료

- 기능 기준: 「MEDILUX 자동포장약검수팀 기능명세서 V1」의 기능 ID(V1-xxx)
- 디자인: Figma 「MEDILUX · 약포장 검수 UI·UX v1」, 「약포장검수_와이어프레임-초안」
- 디자인·명세가 서로 다를 때의 차이와 구현 영향은 계획 문서 §1에 정리했습니다.

## 실행

Node.js 22.12 이상 권장.

```sh
npm install
npm run dev
```

`npm run build`: 타입 검사 후 배포 파일 생성, `npm run preview`: 빌드 결과 확인.
`npm run lint`: 코드 규칙 검사, `npm run typecheck`: 타입 검사.
잠금 파일이 있는 상태에서 동일한 의존성을 설치하려면 `npm ci`를 사용합니다.

## 작업 방식

- GitHub 저장소에 처음 올리는 한 번만 `main`에 직접 push합니다. 그 이후로는 `main`에 직접 올리지 않고 작업 브랜치를 만든 뒤 PR로 합칩니다.
- PR을 올리기 전에 `npm run typecheck`, `npm run lint`, `npm run build`를 통과시킵니다. PR 자동 검사(CI)는 추가 예정입니다(D-009).
- 화면 동작을 바꾸면 PR 설명에 관련 화면 ID(S-xx)와 기능 ID(V1-xxx), 브라우저에서 확인한 시나리오를 적습니다.
- 가상 데이터로 확인한 결과와 실제 서버·장비 연동 결과를 구분해 적습니다.

## 파일 구조

```text
src/
  app/                 # 라우팅·앱 화면 연결
  assets/              # 코드에서 불러오는 이미지·아이콘
  components/          # 공통 UI·레이아웃
  constants/           # 공통 메뉴·상수
  contexts/            # 앱 전역 Provider
  features/
    inspections/       # 검수 기능: pages·components·api·types
  hooks/               # 공통 React 훅
  lib/api/             # 공통 API 클라이언트
  mocks/               # 개발용 가상 데이터
  styles/              # 공통 CSS·디자인 토큰
  types/               # 공통 데이터 타입
  utils/               # 표시 형식 등 공통 함수
public/                # 공개 정적 파일
```

새로운 약품·장비·이력 화면은 필요할 때 `features/medications`, `features/devices`, `features/history`로 추가합니다. 쓰지 않는 상태관리 라이브러리나 비어 있는 업무 모듈은 먼저 추가하지 않았습니다.

## 현재 화면

- `/`: 가상 검수 목록, 검색·상태 필터
- `/inspections/DEMO-001`: 가상 검수 상세
- 없는 주소·검수 ID: 안내 화면

1단계에서 `/live`(S-03 실시간 검수)를 추가하고, `/inspections/:id`를 S-04 판정 화면으로 확장하며, 현재 `/` 목록은 `/history`로 옮길 예정입니다. 기존 주소 `/inspections/DEMO-001`은 계속 열립니다.

모든 데이터는 시연 전용입니다. 이미지·분석 결과·결과 저장·인증은 구현되지 않았습니다.
실제 서버 연결은 `src/features/inspections/api.ts`에서 시작합니다. API 응답의 런타임 검증·인증·권한 처리는 실제 연동 시 추가해야 합니다. `VITE_` 환경 변수에는 비밀키를 넣지 마세요.
