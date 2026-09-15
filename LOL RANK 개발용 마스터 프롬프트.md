# LOL RANK — Full-stack Web Application 개발 지시서

당신은 시니어 Full-stack Engineer이자 Game UI/UX Designer다.

친구들과 League of Legends 5:5 내전을 할 때 사용할 웹 애플리케이션 **“LOL RANK”​**를 제작한다.

단순한 CRUD 관리자 페이지처럼 만들지 말고, **16-bit / 2D Pixel Game 느낌의 실제 게임 UI**처럼 완성도 있게 제작하라.

최종 서비스는 Railway에 배포할 예정이며 기술 스택은 다음을 기준으로 한다.

- Frontend: React + TypeScript + Vite
- Backend: Spring Boot
- Database: PostgreSQL
- Deployment: Railway
- Drag & Drop: 현재 안정적으로 유지보수되는 dnd-kit 계열 라이브러리 사용
- DB Migration: Flyway
- Java: Java 21 기준
- API: REST API

라이브러리 버전은 프로젝트를 생성하는 시점의 최신 안정 버전을 확인하여 서로 호환되는 조합을 사용하라.

---

# 1. 서비스 핵심 컨셉

LOL RANK는 크게 두 가지 기능으로 구성된다.

1. 5 vs 5 팀 메이커
2. 친구 캐릭터 계급도

이 중 서비스의 **메인 화면은 5 vs 5 팀 메이커**다.

일반적인 자동 팀 추첨기가 아니다.

사용자가 도트 캐릭터를 직접 드래그해서

- BLUE TEAM
- RED TEAM

각 포지션에 배치하는 것이 핵심이다.

포지션은 다음 5개다.

- TOP
- JUNGLE
- MID
- ADC
- SUPPORT

사용자가 원하는 사람을 원하는 팀/포지션에 먼저 배치한 후,

**“남은 자리 균형 맞춰 채우기”**

버튼을 누르면 아직 배치되지 않은 캐릭터만 대상으로

1. 포지션 적합도
2. 롤 티어 기반 실력 균형

을 고려하여 남은 자리를 자동으로 채운다.

사용자가 직접 배치한 캐릭터는 자동 배정 시 절대 이동시키지 않는다.

---

# 2. 서비스 사용 방식

복잡한 회원가입/로그인 시스템은 만들지 않는다.

친구들끼리 URL을 공유해서 사용하는 서비스다.

방 개념을 사용한다.

예:

/room/ABCD12

방 링크를 알고 있는 사람은 누구든 캐릭터 생성/수정/팀 편집/계급도 편집을 할 수 있다.

관리자 권한은 존재하지 않는다.

처음 접속한 사용자에게는 가볍게 닉네임만 받는다.

예:

“사용할 닉네임을 입력해주세요.”

닉네임은 localStorage에 저장한다.

회원 테이블이나 인증 토큰은 만들지 않는다.

닉네임의 목적은 추후 변경 기록에

“민준이 태현의 랭크를 변경했습니다.”

처럼 표시하기 위한 것이다.

보안을 위한 인증 수단으로 사용하지 않는다.

---

# 3. 프로젝트 구조

Monorepo 형태로 구성한다.

lol-rank/
  frontend/
  backend/
  docker-compose.yml
  README.md

Frontend 예시:

frontend/src/
  api/
  components/
  features/
    team-maker/
      components/
      hooks/
      types/
      utils/
    hierarchy/
      components/
      hooks/
      types/
    characters/
      components/
  pages/
  routes/
  styles/
  assets/

Backend 예시:

backend/src/main/java/.../
  room/
  character/
  team/
  hierarchy/
  changelog/
  common/

각 도메인은 가능하면

- controller
- service
- repository
- entity
- dto

구조로 분리한다.

과도한 DDD나 복잡한 추상화는 하지 않는다.

이 프로젝트 규모에 맞게 읽기 쉽고 유지보수 가능한 구조를 우선한다.

---

# 4. 메인 화면 — TEAM MAKER

방에 진입하면 가장 먼저 TEAM MAKER를 보여준다.

화면 구조:

┌────────────────────────────────────────────────────────────┐
│ LOL RANK       ROOM NAME         계급도    캐릭터 관리     │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ BLUE TEAM          오늘의 참가자          RED TEAM         │
│                                                            │
│ TOP                [민준] [지성]          TOP              │
│ [ SLOT ]           [태현] [서연]          [ SLOT ]         │
│                    [호성] [민재]                            │
│ JUNGLE             [지훈] [수빈]          JUNGLE           │
│ [ SLOT ]           [도윤] [현우]          [ SLOT ]         │
│                                      	   	                │
│ MID                                      MID               │
│ [ SLOT ]                                [ SLOT ]            │
│                                                            │
│ ADC                                      ADC               │
│ [ SLOT ]                                [ SLOT ]            │
│                                                            │
│ SUPPORT                                  SUPPORT           │
│ [ SLOT ]                                [ SLOT ]            │
│                                                            │
├────────────────────────────────────────────────────────────┤
│ BLUE 평균 티어        TEAM BALANCE       RED 평균 티어     │
│                                                            │
│       [ ✨ 남은 자리 균형 맞춰 채우기 ] [전체 초기화]      │
└────────────────────────────────────────────────────────────┘

화면 중앙에 현재 게임에 참가할 캐릭터 목록을 둔다.

캐릭터가 10명보다 많이 등록되어 있을 수 있으므로 별도로

“오늘의 참가자”

를 선택할 수 있어야 한다.

최대 10명.

예:

전체 캐릭터 17명

오늘 참가

☑ 민준
☑ 지성
☑ 태현
...
10 / 10

선택된 캐릭터만 Team Maker 화면의 중앙 대기 영역에 표시한다.

---

# 5. Drag & Drop UX

이 기능을 서비스에서 가장 높은 우선순위로 구현한다.

캐릭터는 다음 위치 사이에서 자유롭게 이동할 수 있다.

- 참가자 대기 영역 → BLUE 슬롯
- 참가자 대기 영역 → RED 슬롯
- BLUE → RED
- RED → BLUE
- 슬롯 → 참가자 대기 영역
- 슬롯 ↔ 슬롯
- 이미 사람이 있는 슬롯에 드롭 → 두 캐릭터 SWAP

각 슬롯은 명확한 Drop Zone이어야 한다.

캐릭터를 드래그하면 살짝 위로 떠오르며 픽셀 그림자가 생긴다.

주 포지션 위에 드래그할 경우:

✓ MAIN POSITION

또는 시각적으로 긍정적인 효과.

부 포지션:

△ SUB POSITION

다른 포지션:

! OFF POSITION

다른 포지션에도 사용자가 원하면 직접 배치할 수 있어야 한다.

금지하지 않는다.

Drag 상태에서 Drop 가능한 영역에 픽셀 스타일 하이라이트를 표시한다.

---

# 6. MANUAL / AUTO 개념

Team Slot에는 다음 상태가 있다.

MANUAL
AUTO
EMPTY

사용자가 직접 캐릭터를 드래그하여 배치하면:

source = MANUAL

자동 밸런싱으로 배치된 캐릭터는:

source = AUTO

“남은 자리 균형 맞춰 채우기”를 다시 실행하면:

- MANUAL 캐릭터 → 절대 이동 금지
- AUTO 캐릭터 → 기존 자동배치 해제 후 재계산 가능
- EMPTY → 새 캐릭터 배치 가능

자동배정 결과가 마음에 들지 않아 사용자가 AUTO 캐릭터를 직접 이동하면 해당 캐릭터는 즉시 MANUAL 상태로 변경한다.

사람의 선택이 항상 알고리즘보다 우선한다.

---

# 7. 캐릭터 데이터

Character는 최소한 다음 정보를 가진다.

id
roomId
name
description
assetKey

tier
division

mainPosition
subPosition

hierarchyRank
hierarchyOrder

createdAt
updatedAt

Tier:

IRON
BRONZE
SILVER
GOLD
PLATINUM
EMERALD
DIAMOND
MASTER
GRANDMASTER
CHALLENGER

IRON ~ DIAMOND는 division을 가진다.

1
2
3
4

MASTER 이상은 division = null.

Position:

TOP
JUNGLE
MID
ADC
SUPPORT

Hierarchy Rank:

LEGEND
S
A
B
C

---

# 8. skill_score 정책

skill_score는 사용자가 입력하지 않는다.

DB에도 skill_score를 저장하지 않는다.

롤 티어를 기반으로 런타임에서 계산한다.

초기 기준:

IRON IV       10
IRON III      12
IRON II       14
IRON I        16

BRONZE IV     20
BRONZE III    22
BRONZE II     24
BRONZE I      26

SILVER IV     30
SILVER III    32
SILVER II     34
SILVER I      36

GOLD IV       40
GOLD III      42
GOLD II       44
GOLD I        46

PLATINUM IV   50
PLATINUM III  52
PLATINUM II   54
PLATINUM I    56

EMERALD IV    60
EMERALD III   62
EMERALD II    64
EMERALD I     66

DIAMOND IV    70
DIAMOND III   73
DIAMOND II    76
DIAMOND I     79

MASTER        85
GRANDMASTER   92
CHALLENGER    100

이 값은 하나의 Config/Utility에서 관리하여 나중에 쉽게 변경 가능하게 만들어라.

UI에는 원칙적으로 이 내부 숫자를 보여주지 않는다.

사용자는

Gold IV
Platinum II

등 실제 티어만 본다.

---

# 9. 포지션 적합도

자동 배정 시 포지션 페널티를 사용한다.

주 포지션:

Penalty = 0

부 포지션:

Penalty = 8

그 외 포지션:

Penalty = 25

이 값 역시 별도 Config에서 관리한다.

자동배정은 가능한 한

주 포지션
→ 부 포지션
→ 비선호 포지션

순으로 배치한다.

그러나 “실력 차이를 0으로 만들기 위해 모든 캐릭터가 비선호 포지션으로 배치되는 상황”은 피해야 한다.

---

# 10. 자동 팀 밸런싱 알고리즘

AI/ML은 필요하지 않다.

최대 10명의 작은 조합이므로 완전 탐색 또는 충분히 명확한 최적 탐색을 사용한다.

사용자가 직접 지정한 MANUAL 슬롯은 고정한다.

예:

BLUE
TOP = 민준
MID = 지성

RED
TOP = 호성
ADC = 서연

위 4명은 절대로 이동하지 않는다.

나머지 6명만

BLUE의 빈 슬롯 3개
RED의 빈 슬롯 3개

에 배치한다.

각 배치 결과에 대해 다음 Cost를 계산한다.

totalCost =
abs(blueRankScore - redRankScore) * RANK_BALANCE_WEIGHT
+ totalPositionPenalty

초기:

RANK_BALANCE_WEIGHT = 3

가장 낮은 totalCost를 가진 배치를 선택한다.

동점일 경우 우선순위:

1. 비선호 포지션 수가 적은 조합
2. 주 포지션 배치 수가 많은 조합
3. 팀 실력 차이가 작은 조합
4. 마지막에는 랜덤 tie-break 가능

10명 규모에서는 성능보다 알고리즘의 명확성과 정확성을 우선한다.

자동배정 로직은 Unit Test를 작성한다.

최소 테스트:

- 아무도 수동 배치하지 않은 10명
- 2명 수동 배치
- 6명 수동 배치
- 포지션이 심하게 중복된 경우
- MASTER + SILVER 등 티어 차이가 큰 경우
- MANUAL 캐릭터가 절대 움직이지 않는지
- AUTO 캐릭터는 재계산되는지

---

# 11. 팀 밸런스 표시

내부 점수 자체를 크게 보여주지 않는다.

게임 UI처럼 표현한다.

예:

⚖ TEAM BALANCE

BLUE               RED

Gold II           Gold II

█████████░█████████

★★★★★

“매우 균형적인 매치!”

Balance Grade 기준은 Config화한다.

예:

차이 <= 2
PERFECT

차이 <= 5
VERY_GOOD

차이 <= 10
GOOD

차이 <= 15
WARNING

그 이상
UNBALANCED

문구 예:

PERFECT
“완벽에 가까운 밸런스!”

VERY_GOOD
“매우 균형적인 매치!”

GOOD
“충분히 해볼 만한 매치!”

WARNING
“한쪽 팀이 조금 강합니다.”

UNBALANCED
“팀 밸런스 차이가 큽니다!”

숫자 계산은 정확하게 하되 UI는 게임답게 표현한다.

---

# 12. CHARACTER MANAGEMENT

별도 화면 또는 패널에서 캐릭터를 생성/수정한다.

입력:

캐릭터 이름
한 줄 설명
도트 캐릭터
LOL 티어
Division
주 포지션
부 포지션

예:

민준

Gold IV

MAIN
TOP

SUB
MID

“라인전은 강하지만 한타에서 사라짐”

캐릭터 생성/수정은 방에 들어온 누구나 가능하다.

관리자 체크를 하지 않는다.

삭제에는 확인 Modal을 표시한다.

가능하면 Hard Delete보다 Soft Delete 구조를 고려하되, MVP 복잡도가 과도하게 증가하면 일반 삭제로 구현해도 된다.

---

# 13. PIXEL CHARACTER ASSET

캐릭터는 축구선수 느낌의 픽셀 캐릭터를 사용한다.

UI 예시는 호날두, 박지성, 손흥민 같은 유명 축구선수 느낌을 참고하지만 실제 배포 프로젝트에는 저작권/초상권이 불명확한 이미지를 자동으로 다운로드하거나 포함하지 않는다.

대신 다음 구조를 만들어라.

/public/assets/players/

player_01.png
player_02.png
player_03.png
...

Character의 assetKey만 DB에 저장한다.

예:

player_07

실제 에셋은 추후 내가 교체할 수 있도록 한다.

에셋이 없을 경우 개발 단계에서는 직접 만든 간단한 placeholder pixel avatar를 사용한다.

외부 사이트에서 이미지를 스크래핑하지 않는다.

CSS:

image-rendering: pixelated;

를 적절히 사용하여 픽셀 이미지가 흐려지지 않게 한다.

---

# 14. 계급도 화면

두 번째 핵심 기능이다.

게임의 “랭킹 타워”, “길드 계급도”, “명예의 전당” 같은 느낌으로 디자인한다.

구조:

               LEGEND

                👑
              [민준]


               S RANK

        [지성]       [태현]


               A RANK

      [호성] [서연] [민재]


               B RANK


               C RANK

캐릭터를 Drag & Drop으로

C → B
B → A
A → S

등 자유롭게 옮길 수 있다.

같은 Rank 안에서도 순서를 변경할 수 있다.

DB에는

hierarchyRank
hierarchyOrder

를 저장한다.

변경 즉시 Backend에 반영한다.

새로고침 후에도 순서가 유지돼야 한다.

---

# 15. DESIGN SYSTEM

이 프로젝트는 일반적인 SaaS 관리 페이지처럼 보여서는 안 된다.

핵심 키워드:

- 16-bit RPG
- Retro Football Game
- Pixel Sports Club
- Guild Lobby
- Arcade
- Game HUD

Pokémon / 옛날 JRPG / 레트로 축구게임의 감성을 참고하되 특정 게임 UI를 그대로 복제하지 않는다.

## 색상

전체 배경:

Deep Navy
#0D1526

Main Panel:

#172238

Secondary Panel:

#202E48

BLUE TEAM:

#4298FF

BLUE Highlight:

#77B9FF

RED TEAM:

#FF5868

RED Highlight:

#FF8792

Gold Accent:

#F5C451

Grass:

#3E7548

Dark Grass:

#285536

Wood:

#76502F

Cream Text:

#F6EBD3

Muted Text:

#A9B2C3

색상은 필요 시 약간 조정 가능하나 전체적인 톤은 유지한다.

---

# 16. PIXEL UI 규칙

Border는 부드러운 현대 UI보다 픽셀 박스를 사용한다.

예:

border: 3px solid ...

box-shadow:
  4px 4px 0px rgba(...)

가능하면 border-radius를 남발하지 않는다.

일반 패널:

border-radius: 0 ~ 4px

버튼도 pill 형태를 피한다.

잘못된 디자인:

둥근 카드
둥근 SaaS 버튼
gradient 남발
Glassmorphism
과도한 Blur
현대 금융 Dashboard 느낌

원하는 디자인:

픽셀 테두리
돌/나무 프레임
게임 메뉴
HP Bar 같은 Balance Gauge
CRT / Arcade 느낌의 미세한 질감
명확한 팀 컬러

단, 너무 복잡하여 가독성을 해치지 않는다.

---

# 17. Typography

한국어 가독성이 매우 중요하다.

한글 본문 전체를 억지로 픽셀 폰트로 만들지 않는다.

구성:

게임 제목 / 숫자 / 영어 Rank
→ Pixel Display Style

한글 설명 / 입력 / 긴 텍스트
→ 가독성 좋은 Korean Sans-serif

무료 사용 라이선스를 확인할 수 있는 폰트만 사용한다.

라이선스가 확실하지 않다면 OS 기본 폰트 또는 안전한 fallback을 사용한다.

---

# 18. 캐릭터 카드 디자인

캐릭터 카드에는 많은 데이터를 넣지 않는다.

기본:

[Pixel Character]

민준
Gold IV

TOP · MID

정도만 표시한다.

Hover 또는 Click:

민준
Gold IV

MAIN POSITION
TOP

SUB POSITION
MID

“라인전은 강하지만 한타에서 사라짐”

Team Maker에서는 작은 Compact Card.

Character Management에서는 큰 Card.

Hierarchy에서는 캐릭터와 이름 중심의 Trophy Card.

같은 캐릭터라도 화면에 맞게 크기를 다르게 한다.

---

# 19. 애니메이션

Framer Motion 또는 가벼운 CSS Animation을 필요한 곳에만 사용한다.

과도한 애니메이션은 피한다.

권장:

캐릭터 Hover:
1~2px 위로 움직임

Drag:
scale 1.05

Drop 성공:
짧은 bounce

Auto Fill:
캐릭터들이 50~100ms 간격으로 슬롯에 들어가는 느낌

버튼 Hover:
1~2px 이동 + 픽셀 Shadow 변경

Hierarchy 이동:
짧은 상승/하강 Animation

애니메이션 속도:

100~250ms 중심

느리고 무거운 Transition은 사용하지 않는다.

---

# 20. 반응형

Desktop First.

1440px 화면에서 가장 완성도 있게 디자인한다.

1280px 이상:

BLUE / 참가자 / RED
3 Column

900 ~ 1279px:

중앙 참가자 영역을 조금 좁게 유지

900px 미만:

Team 영역을 위/아래 또는 Tab으로 전환

모바일에서도 사용은 가능해야 하지만 MVP에서는 데스크톱 UX 품질을 최우선으로 한다.

---

# 21. PostgreSQL

필요한 최소 테이블을 설계한다.

ROOM

id
name
invite_code
created_at


CHARACTER

id
room_id
name
description
asset_key
tier
division
main_position
sub_position
hierarchy_rank
hierarchy_order
created_at
updated_at


TEAM_PARTICIPANT

id
room_id
character_id
selected
updated_at


TEAM_SLOT

id
room_id
team
position
character_id nullable
assignment_source nullable
updated_at


CHANGE_LOG

id
room_id
character_id nullable
nickname
action
before_data JSONB nullable
after_data JSONB nullable
created_at

필요하다면 더 좋은 모델로 조정할 수 있지만 과도하게 복잡하게 만들지 않는다.

FK / Unique Constraint를 적절히 구성한다.

예:

(room_id, team, position)

은 하나의 슬롯만 존재해야 한다.

---

# 22. REST API

최소 API:

POST /api/rooms

GET /api/rooms/{inviteCode}


GET /api/rooms/{inviteCode}/characters

POST /api/rooms/{inviteCode}/characters

PATCH /api/characters/{characterId}

DELETE /api/characters/{characterId}


GET /api/rooms/{inviteCode}/team-board

PUT /api/rooms/{inviteCode}/participants

PUT /api/rooms/{inviteCode}/team-board


POST /api/rooms/{inviteCode}/team-board/auto-fill


PUT /api/rooms/{inviteCode}/hierarchy


GET /api/rooms/{inviteCode}/change-logs

필요하면 REST 설계를 더 자연스럽게 개선해도 된다.

DTO validation을 사용한다.

Entity를 API Response에 직접 노출하지 않는다.

---

# 23. 자동배정 API

POST

/api/rooms/{inviteCode}/team-board/auto-fill

이 API는 현재 DB의

- 참가자
- MANUAL 슬롯

정보를 읽고 자동 계산한다.

AUTO 슬롯은 먼저 계산 대상에서 제거한다.

그 다음 남아 있는 캐릭터를 대상으로 최적 조합을 찾는다.

Response에는 최종 슬롯과 Balance 정보를 반환한다.

예:

{
  "slots": [
    {
      "team": "BLUE",
      "position": "TOP",
      "characterId": 1,
      "source": "MANUAL"
    },
    {
      "team": "BLUE",
      "position": "JUNGLE",
      "characterId": 8,
      "source": "AUTO"
    }
  ],
  "balance": {
    "blueScore": 224,
    "redScore": 226,
    "difference": 2,
    "grade": "PERFECT"
  }
}

---

# 24. 상태 관리

Frontend 상태 관리 라이브러리는 반드시 필요한 경우에만 사용한다.

우선순위:

React Query 또는 동급의 서버 상태 관리
+
Context 또는 Local State

전역 상태를 무조건 Zustand/Redux에 넣지 않는다.

Drag 중인 임시 상태는 Frontend에서 관리하고, Drop 완료 시 Backend에 반영한다.

Optimistic UI를 사용할 수 있으면 적용하되 실패하면 Rollback한다.

---

# 25. Error UX

일반적인 브라우저 alert를 남발하지 않는다.

Pixel UI Modal / Toast를 만든다.

예:

“캐릭터 저장 완료!”

“이미 10명의 참가자가 선택되어 있습니다.”

“팀 정보를 저장하지 못했습니다.”

“다시 시도해주세요.”

Loading 상태 역시 단순 Spinner 대신 작은 픽셀 애니메이션 또는 점멸 Indicator를 사용한다.

---

# 26. 빈 상태

캐릭터가 없으면:

“아직 등록된 선수가 없습니다!”

[ 첫 캐릭터 만들기 ]

오늘 참가자가 없으면:

“오늘의 내전 멤버를 선택해주세요.”

Hierarchy가 비어 있으면:

“아직 계급도가 비어 있습니다.”

와 같이 서비스 세계관에 맞는 문구를 사용한다.

---

# 27. Railway 배포

최종적으로 Railway에

Frontend
Backend
PostgreSQL

을 배포할 수 있도록 구성한다.

Backend DB 설정은 환경 변수로 관리한다.

예:

PGHOST
PGPORT
PGDATABASE
PGUSER
PGPASSWORD

또는 Railway 환경에 적합한 Datasource 환경변수.

비밀번호, DB URL 등을 Git Repository에 커밋하지 않는다.

Frontend에는

VITE_API_BASE_URL

을 사용한다.

Local 개발용:

docker-compose.yml

에서 PostgreSQL을 실행할 수 있게 만든다.

README에는

1. Local 실행법
2. PostgreSQL 실행법
3. Frontend 실행법
4. Backend 실행법
5. Railway 환경 변수
6. Railway 배포 방법

을 작성한다.

---

# 28. 테스트

Backend:

- Rank Score 계산 테스트
- Position Penalty 테스트
- Auto Fill 알고리즘 테스트
- MANUAL 슬롯 보존 테스트
- Character CRUD 기본 테스트

Frontend:

최소한 핵심 Utility와 상태 변경 로직은 테스트한다.

가능하다면 Team Maker에 대한 기본 Component Test도 추가한다.

테스트를 추가했으면 직접 실행하고 실패한 테스트를 수정한다.

---

# 29. 코드 품질

다음 원칙을 따른다.

- TypeScript strict
- any 사용 최소화
- 의미 있는 변수명
- 중복 Enum 최소화
- Magic Number 금지
- 알고리즘 상수 Config 분리
- API DTO 분리
- Component 지나치게 비대해지지 않게 분리
- CSS 변수로 Design Token 관리
- console.log 제거
- dead code 제거

단, 과도한 추상화는 하지 않는다.

“미래에 필요할지도 모르는 기능”을 위해 복잡한 시스템을 미리 구현하지 않는다.

---

# 30. MVP에서 만들지 않을 것

현재 단계에서는 다음 기능을 만들지 않는다.

- 회원가입
- OAuth
- 관리자 권한
- 결제
- Riot API 연동
- 실제 LoL 전적 자동 조회
- 실시간 WebSocket 동기화
- AI 모델
- 친구 기능
- 채팅
- 복잡한 시즌 시스템

필요하면 추후 확장한다.

현재 목표는

**“친구들과 실제로 사용할 수 있는 재미있는 팀 메이커 + 계급도”**

를 완성하는 것이다.

---

# 31. 개발 우선순위

다음 순서로 구현한다.

PHASE 1

프로젝트 Scaffold

- React
- Spring
- PostgreSQL
- Flyway
- Local docker-compose
- 기본 Routing


PHASE 2

Room + Character

- DB
- Entity
- API
- 캐릭터 생성/수정
- Pixel Character Card


PHASE 3

Team Maker

- 참가자 선택
- BLUE / RED Board
- Position Slot
- Drag & Drop
- Swap
- Bench 복귀
- MANUAL 상태


PHASE 4

Auto Fill

- Tier Score
- Position Penalty
- 최적 조합 계산
- AUTO 상태
- Balance Gauge


PHASE 5

Hierarchy

- LEGEND / S / A / B / C
- Drag & Drop
- 같은 Rank 정렬
- DB 저장


PHASE 6

Polish

- Pixel Design
- Animation
- Empty State
- Toast
- Responsive
- Error Handling


PHASE 7

Deploy

- Production Build 확인
- Railway 설정
- README

각 Phase가 끝날 때마다

- Frontend build
- Backend test
- Backend build

를 실행하여 오류가 없는지 확인한다.

문제가 있다면 다음 단계로 넘어가기 전에 수정한다.

---

# 32. 중요 UI 원칙

기능만 작동하는 못생긴 Prototype으로 끝내지 않는다.

처음부터 최종 서비스에 가까운 UI를 만든다.

특히 Team Maker 화면의 완성도를 가장 높게 가져간다.

사용자가 화면을 봤을 때:

“관리자 사이트 같다”

가 아니라

“친구들이 같이 하는 작은 픽셀게임 같다”

고 느껴야 한다.

캐릭터가 이 서비스의 주인공이다.

텍스트와 Form보다 캐릭터 Sprite가 항상 시각적으로 우선한다.

---

# 33. 완료 조건

다음 조건을 만족하면 MVP가 완료된 것이다.

1. 방을 생성할 수 있다.
2. 공유 URL로 방에 들어갈 수 있다.
3. 누구나 캐릭터를 생성할 수 있다.
4. 캐릭터의 티어와 포지션을 설정할 수 있다.
5. 최대 10명을 오늘의 참가자로 선택할 수 있다.
6. 캐릭터를 BLUE/RED 포지션에 Drag & Drop할 수 있다.
7. 캐릭터끼리 Swap할 수 있다.
8. 캐릭터를 다시 대기석으로 뺄 수 있다.
9. 직접 배치한 캐릭터는 MANUAL로 유지된다.
10. Auto Fill 실행 시 MANUAL 캐릭터는 움직이지 않는다.
11. 남은 캐릭터가 티어 + 포지션 기준으로 자동배치된다.
12. Team Balance 결과가 표시된다.
13. 자동배정 후에도 사람이 다시 자유롭게 수정할 수 있다.
14. 캐릭터를 LEGEND/S/A/B/C 계급도에 Drag & Drop할 수 있다.
15. 새로고침해도 DB 데이터가 유지된다.
16. 전체 UI가 일관된 16-bit Pixel Game 스타일이다.
17. Frontend production build가 성공한다.
18. Backend test/build가 성공한다.
19. Railway에서 Frontend + Backend + PostgreSQL을 실행할 수 있다.

---

# 34. 작업 방식

먼저 현재 Repository 상태를 확인하라.

이미 존재하는 코드가 있다면 무작정 덮어쓰지 말고 기존 구조를 분석한 뒤 재사용한다.

Repository가 비어 있다면 위 구조대로 프로젝트를 생성한다.

사소한 결정마다 나에게 질문하지 말고 이 명세를 기반으로 합리적인 기본값을 선택하여 계속 구현한다.

명세에 없는 부분에서는 다음 우선순위를 따른다.

1. 사용자 경험
2. 단순한 구조
3. 유지보수성
4. 게임다운 디자인
5. 개발 속도

첫 단계에서는 전체 파일을 한꺼번에 대충 만드는 대신 실제로 실행 가능한 Vertical Slice를 먼저 만든다.

추천 첫 Vertical Slice:

Room 생성
→ Character 생성
→ Character 목록
→ Team Maker에 캐릭터 표시
→ BLUE TOP 슬롯으로 Drag & Drop
→ DB 저장
→ 새로고침 후 유지

이 흐름이 실제로 동작하는 것을 확인한 뒤 나머지 기능을 확장한다.

지금부터 Repository를 분석하고 구현을 시작하라.

우선:

1. 현재 프로젝트 상태 파악
2. 필요한 프로젝트 구조 제안
3. 구현 계획을 짧게 작성
4. 바로 PHASE 1 구현

순서로 진행하라.