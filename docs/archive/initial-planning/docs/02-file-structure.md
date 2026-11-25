# 웹앱 파일 구성 제안

아래는 앞으로 구현할 구조이며, 현재 생성된 실행 파일 목록이 아니다. 지금은 README와 docs 안의 문서만 존재한다.

## 접근 방식 비교

| 방식 | 장점 | 고려점 |
| --- | --- | --- |
| React + Vite, 별도 API | 업무 화면을 빠르게 검토하고 AI·장비 API를 독립적으로 연결하기 좋음 | 로그인·저장·권한을 처리할 서버가 별도로 필요 |
| Next.js, 웹·서버 통합 | 웹 페이지와 서버 기능을 한 프로젝트에서 다루기 좋음 | 서버·클라이언트 경계와 배포 구성을 함께 결정해야 함 |

**제안: React + TypeScript + Vite.** 우선 검수 화면을 만드는 목표에 맞추고, AI·장비 연동 방식을 확정한 후 서버를 결정한다. 웹이 목표라는 이유만으로 Next.js가 필수인 것은 아니다.

## 제안 구조

```text
SaaS_Medilux/
├── README.md
├── docs/
│   ├── 01-project-brief.md
│   ├── 02-file-structure.md
│   ├── 03-frontend-guidelines.md
│   ├── 04-data-and-integration.md
│   ├── 05-roadmap.md
│   └── references/open-source-references.md
├── public/                         # 공개 로고·일반 정적 파일
├── src/
│   ├── app/
│   │   ├── main.tsx                # 앱 시작
│   │   ├── router.tsx              # URL과 화면 연결
│   │   ├── providers.tsx           # 공통 상태·데이터 공급
│   │   └── layouts/AppLayout.tsx   # 사이드 메뉴·상단 바
│   ├── pages/
│   │   ├── DashboardPage.tsx
│   │   ├── InspectionListPage.tsx
│   │   ├── InspectionDetailPage.tsx
│   │   ├── MedicationListPage.tsx
│   │   ├── DeviceListPage.tsx
│   │   ├── AuditLogPage.tsx
│   │   └── SettingsPage.tsx
│   ├── features/
│   │   ├── inspections/
│   │   │   ├── components/         # 결과표·비교 화면·검토 폼
│   │   │   ├── api.ts              # 검수 조회·저장 요청
│   │   │   ├── types.ts            # 검수·AI 결과·작업자 결정 타입
│   │   │   ├── schemas.ts          # 외부 입력·응답 검증
│   │   │   └── hooks/              # 검수 화면에서 재사용하는 로직
│   │   ├── medications/            # 약품 검색·상세
│   │   ├── devices/                # 장비 상태·연결 정보
│   │   ├── audit-log/              # 변경 이력 조회
│   │   └── auth/                   # 실제 인증 연동 시 추가
│   ├── shared/
│   │   ├── ui/                     # 버튼·입력·모달·상태 배지
│   │   ├── api/client.ts           # 공통 통신·오류 처리
│   │   ├── config/env.ts           # 환경 설정 검증
│   │   ├── lib/                    # 날짜·표시 형식 등 공통 함수
│   │   └── styles/                 # 색상·간격·글꼴·기본 스타일
│   └── mocks/
│       ├── fixtures/               # 시연 전용 가상 검수·약품 데이터
│       └── handlers.ts             # 가상 API 응답
├── tests/e2e/                      # 목록→검토→저장 등 핵심 흐름
├── .env.example                    # 공개 가능한 설정 이름·예시
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
└── vite.config.ts
```

## 배치 원칙

- `pages`는 화면 조합, `features`는 업무 기능, `shared`는 여러 기능에서 쓰는 공통 코드다.
- 특정 기능에서만 쓰는 버튼·표·타입을 무조건 shared로 옮기지 않는다.
- 파일은 필요할 때 만든다. 사용하지 않는 빈 화면과 폴더를 먼저 늘리지 않는다.
- 실제 이미지·처방·개인정보·비밀키를 public, mocks, 저장소에 넣지 않는다.
- Vite의 브라우저 환경 변수는 사용자에게 노출될 수 있으므로 서버 비밀키를 넣지 않는다.
- Python AI 서버, 데이터베이스, 장비 수집기는 구조가 확정될 때 별도 서비스로 추가한다.
- 의존성 버전과 실행 명령은 실제 앱을 생성할 때 검증해 README에 기록한다.
