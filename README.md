# LOL RANK

친구들과 League of Legends 5:5 내전을 할 때 쓰는 **16-bit 픽셀 게임 스타일 팀 메이커 + 계급도** 웹앱.

- 방에 들어오면 **마을 로비**(하늘·성·잔디)에서 "5 vs 5 팀 배정" / "롤 랭크 계급도" 건물로 입장
- **팀 배정**: 도트 캐릭터를 직접 드래그해서 BLUE / RED 팀의 TOP · JUNGLE · MID · ADC · SUPPORT 슬롯에 배치. 사람이 배치한 자리(MANUAL)는 고정하고 **남은 자리만** 자동 채우기(AUTO)
  - 배정 방식 3종: 실력 균형 / 포지션 균형 / 완전 랜덤 (`?mode=`)
  - 하단 TEAM POWER 바(팀 평균 실력)와 밸런스 등급
- **계급도**: 석조 타워 위 LEGEND / S / A / B / C 를 드래그로 편집, 카드를 클릭하면 우측 상세 카드에서 등급 변경·소개 수정·삭제
- **캐릭터 생성**: 종이 패널 폼(기본 정보 · 캐릭터 선택 · 소개 문구) + 대형 스프라이트 미리보기
- 로그인 없음. 사이트 링크를 아는 사람은 누구나 편집 가능. 닉네임은 변경 기록 표시용
- **단일 방 모드**: 서버가 기동할 때 기본 방(`APP_DEFAULT_ROOM_CODE`, 기본 `LOLRNK`)을 만들고 `/` 는 그 방 로비로 바로 이동합니다. 다른 그룹용 방이 필요하면 `POST /api/rooms` 로 만든 뒤 `/room/{code}` URL 을 공유하면 됩니다.

### 화면 경로

| 경로 | 화면 |
| --- | --- |
| `/` | 기본 방 로비로 자동 이동 |
| `/room/{code}` | 마을 로비 |
| `/room/{code}/team` | 팀 배정 |
| `/room/{code}/hierarchy` | 계급도 |
| `/room/{code}/characters` | 선수 명단 (캐릭터 생성·수정·삭제) |

### 그림 에셋 (모두 CC0)

| 팩 | 용도 | 결과물 | 추출 스크립트 |
| --- | --- | --- | --- |
| [Tiny Swords (구버전)](https://pixelfrog-assets.itch.io/tiny-swords) by Pixel Frog | 캐릭터 24종(기사·궁수·농민·고블린 3종 × 4색), 로비 성·집·탑·나무·장식, 잔디/모래 타일, 리본 UI | `frontend/public/assets/tiny/` | `frontend/scripts/extract-tiny-swords.py` |
| [Ninja Adventure](https://pixel-boy.itch.io/ninja-adventure-asset-pack) by Pixel-boy & AAA | 캐릭터 32종 + NPC, 던전 석벽 타일·등잔, 말풍선·이모트·아이콘 | `frontend/public/assets/ninja/` | `frontend/scripts/extract-ninja-assets.py` |

- 저장소에는 추출된 결과물만 들어 있습니다. 원본 팩은 `.tmp-tiny-swords/`, `.tmp-ninja-pack/` 에 풀어두고(git ignore) 스크립트를 실행하면 다시 만들어집니다 (Pillow 필요).
- 캐릭터 키: Tiny Swords 는 `ts_{병종}_{색}` (예 `ts_warrior_blue`, 96px 프레임), Ninja Adventure 는 `ninja_blue` 등(16px). 목록과 순서는 `frontend/src/lib/assets.ts` 의 `ASSET_GROUPS`, 예전 `player_01~12` 키는 같은 파일의 alias 로 매핑됩니다.
- 각 캐릭터는 `{key}.png`(정면), `{key}_face.png`(초상화), `{key}_walk.png`(걷기 시트 4방향×4프레임) 세 파일로 구성되며 `PixelAvatar` / `WalkingSprite` 가 프레임 크기를 키로 판별합니다.
- Tiny Swords **Free Pack(현행판)** 은 재배포 금지 조건이라 사용하지 않습니다. CC0 인 구버전만 씁니다.
- 배경 그림 파일 `frontend/public/assets/bg/village.png`, `dungeon.png`, `castle.png` 를 두면 타일 배경 위에 덮어 그려집니다(선택).
- 한글 픽셀 폰트는 [Galmuri](https://github.com/quiple/galmuri) (OFL-1.1), 영문 픽셀 폰트는 Press Start 2P (OFL) 를 사용합니다.

## 1. 로컬 실행 (요약)

```bash
# 1) PostgreSQL
docker compose up -d

# 2) Backend (http://localhost:8080)
cd backend && ./gradlew bootRun

# 3) Frontend (http://localhost:5174)
cd frontend && npm install && npm run dev
```

브라우저에서 <http://localhost:5174> 접속 → 방 만들기 → 닉네임 입력 → 캐릭터 관리에서 캐릭터 생성 → TEAM MAKER.

> Docker 없이 바로 보고 싶다면 백엔드를 인메모리 H2 로 띄울 수 있습니다 (데이터는 재시작 시 사라짐):
> `cd backend && ./gradlew bootRun --args='--spring.profiles.active=local-h2'`

## 2. PostgreSQL 실행법

`docker-compose.yml` 이 `postgres:17-alpine` 을 5432 포트로 띄웁니다. 기본 계정은 모두 `lolrank` 입니다.

```bash
docker compose up -d          # 시작
docker compose logs -f postgres
docker compose down           # 중지 (데이터 유지)
docker compose down -v        # 중지 + 데이터 삭제
```

다른 값으로 바꾸려면 루트에 `.env` 를 만들고(`.env.example` 참고) `PGDATABASE / PGUSER / PGPASSWORD / PGPORT` 를 지정하세요. 스키마는 백엔드 기동 시 Flyway 가 `backend/src/main/resources/db/migration` 을 적용해 자동 생성합니다.

## 3. Frontend 실행법

```bash
cd frontend
npm install
npm run dev        # 개발 서버 http://localhost:5174  (/api → localhost:8080 프록시)
npm run build      # 타입체크 + 프로덕션 빌드 → dist/
npm run preview    # dist/ 미리보기 (4173)
npm test           # Vitest 단위 테스트
```

- `VITE_API_BASE_URL` 이 비어 있으면 같은 origin 의 `/api` 를 호출합니다 (개발 서버는 Vite 프록시가 8080 으로 넘겨줌).
- 프록시 대상을 바꾸려면 `VITE_PROXY_TARGET=http://host:port npm run dev`.
- 픽셀 캐릭터 에셋은 `frontend/public/assets/players/player_01.png ~ player_12.png` 입니다. 같은 파일명으로 교체하면 바로 반영됩니다. 현재 파일은 `node scripts/generate-placeholder-sprites.mjs` 로 만든 개발용 placeholder 입니다.

## 4. Backend 실행법

```bash
cd backend
./gradlew bootRun                         # PostgreSQL 사용 (환경 변수 아래 참고)
./gradlew test                            # 단위 + 통합 테스트 (H2)
./gradlew build                           # 테스트 + jar 빌드 → build/libs/
```

로컬 기본값은 `localhost:5432/lolrank`, 계정 `lolrank/lolrank` 이며 환경 변수로 덮어쓸 수 있습니다.

| 변수 | 설명 | 기본값 |
| --- | --- | --- |
| `PGHOST` / `PGPORT` / `PGDATABASE` / `PGUSER` / `PGPASSWORD` | DB 접속 정보 | localhost / 5432 / lolrank / lolrank / lolrank |
| `SPRING_DATASOURCE_URL` | JDBC URL 을 직접 지정할 때 (PG* 보다 우선) | `jdbc:postgresql://${PGHOST}:${PGPORT}/${PGDATABASE}` |
| `PORT` | HTTP 포트 | 8080 |
| `APP_CORS_ALLOWED_ORIGINS` | 허용 origin (콤마 구분) | `http://localhost:5173,http://localhost:5174,http://localhost:4173` |
| `APP_DEFAULT_ROOM_CODE` / `APP_DEFAULT_ROOM_NAME` | 단일 방 모드의 기본 방 코드/이름. 이름은 기동 시마다 DB 에 반영되므로 변수만 바꾸고 재배포하면 방 이름이 바뀝니다 | `LOLRNK` / `우리들의 내전` |

### REST API

| Method | Path | 설명 |
| --- | --- | --- |
| GET | `/api/rooms` | 모든 방 목록 + 캐릭터 수 (데이터가 어느 방에 있는지 확인용) |
| GET | `/api/rooms/default` | 기본 방 (없으면 생성, 이름은 `APP_DEFAULT_ROOM_NAME` 에 맞춤) |
| POST | `/api/rooms` | 방 생성 `{name}` |
| GET | `/api/rooms/{inviteCode}` | 방 조회 |
| DELETE | `/api/rooms/{inviteCode}` | 방과 그 안의 캐릭터·보드·기록 삭제 (기본 방은 불가) |
| GET / POST | `/api/rooms/{inviteCode}/characters` | 캐릭터 목록 / 생성 |
| PATCH / DELETE | `/api/characters/{id}` | 캐릭터 수정 / 삭제 |
| GET / PUT | `/api/rooms/{inviteCode}/team-board` | 팀 보드 조회 / 전체 교체 |
| PUT | `/api/rooms/{inviteCode}/participants` | 오늘의 참가자 (최대 10명) |
| POST | `/api/rooms/{inviteCode}/team-board/auto-fill?mode=SKILL_BALANCE` | 남은 자리 자동 채우기 (`SKILL_BALANCE` / `POSITION_BALANCE` / `RANDOM`) |
| PUT | `/api/rooms/{inviteCode}/hierarchy` | 계급도 저장 |
| GET | `/api/rooms/{inviteCode}/change-logs?limit=50` | 변경 기록 |

쓰기 요청에는 `X-Nickname` 헤더(URL 인코딩된 닉네임)를 붙이면 변경 기록에 표시됩니다. 인증 용도가 아닙니다.

### 밸런싱 규칙 (모두 `team/balance/BalanceConfig.java` 에서 조정)

- 티어 점수: IRON IV 10 … DIAMOND I 79, MASTER 85, GRANDMASTER 92, CHALLENGER 100 (DB 에 저장하지 않고 런타임 계산)
- 포지션 페널티: 주 0 / 부 8 / 그 외 25 (포지션 균형 모드는 가중치 1, 페널티 0 / 20 / 80)
- `totalCost = |blue - red| × 가중치 + Σ 포지션 페널티` 가 최소인 조합을 완전 탐색(`AutoFillSolver`). 완전 랜덤 모드는 탐색 없이 무작위 배치
- 동점: 비선호 포지션 적음 → 주 포지션 많음 → 실력 차이 작음 → 랜덤
- Balance Grade: 차이 ≤2 PERFECT, ≤5 VERY_GOOD, ≤10 GOOD, ≤15 WARNING, 그 이상 UNBALANCED

## 5. Railway 환경 변수

Railway 프로젝트에 **PostgreSQL**, **backend**, **frontend** 세 서비스를 만듭니다.

### backend 서비스

| 변수 | 값 |
| --- | --- |
| `PGHOST` | `${{Postgres.PGHOST}}` |
| `PGPORT` | `${{Postgres.PGPORT}}` |
| `PGDATABASE` | `${{Postgres.PGDATABASE}}` |
| `PGUSER` | `${{Postgres.PGUSER}}` |
| `PGPASSWORD` | `${{Postgres.PGPASSWORD}}` |
| `APP_CORS_ALLOWED_ORIGINS` | 프론트 공개 URL, 예 `https://lol-rank-frontend.up.railway.app` |

`PORT` 는 Railway 가 자동 주입합니다. (Public Networking 에서 도메인을 생성하세요.)

### frontend 서비스

| 변수 | 값 |
| --- | --- |
| `VITE_API_BASE_URL` | 백엔드 공개 URL, 예 `https://lol-rank-backend.up.railway.app` (끝에 `/` 없이) |

`VITE_*` 는 빌드 시점에 번들에 들어가므로 값을 바꾸면 **재배포**가 필요합니다.

비밀번호나 DB URL 은 절대 리포지토리에 커밋하지 마세요. `.env` 는 `.gitignore` 에 포함되어 있습니다.

## 6. Railway 배포 방법

현재 배포 (2026-09-15 기준, 프로젝트 `lolrank`):

| 서비스 | URL |
| --- | --- |
| frontend | https://frontend-production-5880f.up.railway.app |
| backend | https://backend-production-878d.up.railway.app (`/actuator/health`) |
| Postgres | Railway 내부 네트워크 (`postgres.railway.internal`) |

### CLI 로 처음부터 만들기

```bash
railway login
railway init --name lolrank                 # 프로젝트 생성 + 현재 폴더 링크
railway add -d postgres                     # Postgres 서비스
railway add -s backend
railway add -s frontend

railway variable set -s backend --skip-deploys   'PGHOST=${{Postgres.PGHOST}}' 'PGPORT=${{Postgres.PGPORT}}'   'PGDATABASE=${{Postgres.PGDATABASE}}' 'PGUSER=${{Postgres.PGUSER}}' 'PGPASSWORD=${{Postgres.PGPASSWORD}}'
railway domain -s backend                   # 백엔드 공개 도메인 생성
railway domain -s frontend                  # 프론트 공개 도메인 생성
railway variable set -s backend  --skip-deploys 'APP_CORS_ALLOWED_ORIGINS=https://<frontend-domain>'
railway variable set -s frontend --skip-deploys 'VITE_API_BASE_URL=https://<backend-domain>'
```

### 배포 (코드 업로드)

각 서비스는 하위 폴더의 Dockerfile 로 빌드합니다. **해당 폴더 안에서** `railway up` 을 실행하세요.

```bash
cd backend  && railway up -s backend  -d
cd frontend && railway up -s frontend -d
```

> Windows CLI 에서 `railway up <path>` 가 `prefix not found` 로 실패하면, 링크된 폴더 밖(예: 임시 폴더)에 backend/ 또는 frontend/ 를 복사한 뒤
> `railway up -p <projectId> -e production -s <service> -d` 로 올리면 됩니다.

### GitHub 자동 배포로 바꾸려면

Railway 대시보드에서 각 서비스 → Settings → Source 에 GitHub 리포 `cen04088/lolrank` 를 연결하고 **Root Directory** 를 `backend` / `frontend` 로 지정하면 push 마다 자동 배포됩니다. `VITE_*` 값을 바꾸면 프론트는 재배포가 필요합니다.

헬스체크가 필요하면 backend 는 `/actuator/health` 를 사용하세요.

## 테스트

```bash
cd backend && ./gradlew test     # SkillScore / PositionFit / BalanceGrade / AutoFillSolver 단위 테스트,
                                 # TeamBoardService(MANUAL 보존·AUTO 재계산·SWAP), Character API 통합 테스트
cd frontend && npm test          # 보드 드롭 계산(applyDrop, swap, bench 복귀), 계급도 이동 로직
```
