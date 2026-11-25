# 오픈소스 참고 조사

확인일: 2026-11-02. 공개 저장소의 README와 문서를 확인한 구조·기능 참고 자료다. 앱을 설치·실행하거나 코드를 정밀 감사한 결과는 아니다. 여기서 조사한 프로젝트를 ATDPS 후장착 자동검수와 동일한 완성품으로 확인한 것은 아니다.

## 유사 기능을 가진 앱

### Medplum

- 원문: https://github.com/medplum/medplum
- 시작 예제: https://github.com/medplum/medplum-hello-world
- 확인 내용: 의료 앱 개발 플랫폼, 인증·API·클라이언트 SDK·React UI 구성요소를 제공한다. 시작 예제는 React + Vite + TypeScript와 라우팅·데이터 조회를 보여준다.
- Medilux 적용 제안: 화면과 API 계층을 구분하고, 데이터 조회·업무 화면·권한을 분리한다.
- 도입 미정: Medplum 서버나 FHIR를 Medilux의 필수 의존성으로 결정한 것은 아니다.

### OpenBoxes

- 원문: https://github.com/openboxes/openboxes
- 확인 내용: 의료기관의 재고와 물품 이동을 관리하는 오픈소스 시스템이다.
- Medilux 적용 제안: 약품 목록, 작업 상태, 검색·필터, 이력 조회의 업무 구성을 참고한다.
- 도입 미정: 재고 관리 전체 기능이나 기존 Grails 서버 구조를 복제하지 않는다. 자동 이미지 검수 앱과는 범위가 다르다.

### Label Studio

- 원문: https://github.com/HumanSignal/label-studio
- 확인 내용: 이미지 등을 포함한 여러 데이터 형식의 라벨링·주석 도구다.
- Medilux 적용 제안: 이미지 확인 영역과 검토 입력 영역을 구분하는 작업 공간을 검토할 때 참고한다.
- 도입 미정: 약품 자동검수 기능이 제공된다는 의미가 아니다. 학습용 라벨링 도구와 운영 검수 화면은 구분한다.

## 프런트엔드 지침

| 자료 | 원문 | 사용 목적 |
| --- | --- | --- |
| Vercel Web Interface Guidelines | https://github.com/vercel-labs/web-interface-guidelines/blob/main/command.md | 접근성·폼·상태·성능 검토 |
| Vercel React Best Practices | https://github.com/vercel-labs/agent-skills/blob/main/skills/react-best-practices/AGENTS.md | React 코드·데이터 요청·렌더링 검토 |
| Anthropic Frontend Design | https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md | 제품 목적에 맞는 시각적 방향 참고 |
| Google TS/JS Style Guide | https://google.github.io/styleguide/tsguide.html | TypeScript 코드 일관성 참고 |

React 지침의 Next.js 전용 항목은 React + Vite에 그대로 적용하지 않는다. Google 문서도 외부 개발 환경에는 일부 조언이 맞지 않을 수 있음을 명시한다. Anthropic의 미적 지침은 검수 정보의 가독성과 업무 효율을 우선하는 범위에서 적용한다.

## 원문 파일을 별도 추가하려면

- UI 지침: https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md
- React 지침: https://raw.githubusercontent.com/vercel-labs/agent-skills/main/skills/react-best-practices/AGENTS.md

외부 원문은 이 문서 묶음에 포함하지 않았다. 내려받은 원문을 재배포하거나 코드를 가져올 경우 해당 저장소·파일의 라이선스와 고지를 함께 확인한다. 웹 링크의 내용은 변경될 수 있으므로 실제 도입 시 커밋 또는 버전을 기록한다.
