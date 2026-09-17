-- 경기(조합) 기록. 팀 보드가 다 찼을 때 그 순간의 배치를 스냅샷으로 남기고, 승패는 나중에 채울 수 있다.
-- 캐릭터가 지워지거나 등급·티어가 바뀌어도 당시 값이 남도록 이름/계급/티어/전투력을 함께 저장한다.
-- 이후 밸런스 보정(레이팅)의 학습 데이터로 쓴다.
CREATE TABLE match_record (
    id           BIGSERIAL PRIMARY KEY,
    room_id      BIGINT       NOT NULL REFERENCES room (id) ON DELETE CASCADE,
    played_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    winner       VARCHAR(10),
    note         VARCHAR(100),
    recorded_by  VARCHAR(20)  NOT NULL,
    blue_score   INTEGER      NOT NULL,
    red_score    INTEGER      NOT NULL,
    difference   INTEGER      NOT NULL,
    grade        VARCHAR(20)  NOT NULL,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_match_record_room_played ON match_record (room_id, played_at DESC);

CREATE TABLE match_record_slot (
    id              BIGSERIAL PRIMARY KEY,
    match_id        BIGINT      NOT NULL REFERENCES match_record (id) ON DELETE CASCADE,
    team            VARCHAR(10) NOT NULL,
    board_position  VARCHAR(10) NOT NULL,
    character_id    BIGINT      REFERENCES player_character (id) ON DELETE SET NULL,
    character_name  VARCHAR(20) NOT NULL,
    title           VARCHAR(20),
    asset_key       VARCHAR(40) NOT NULL,
    hierarchy_rank  VARCHAR(10) NOT NULL,
    tier            VARCHAR(20) NOT NULL,
    division        INTEGER,
    strength        INTEGER     NOT NULL,
    CONSTRAINT uq_match_record_slot UNIQUE (match_id, team, board_position)
);

CREATE INDEX idx_match_record_slot_character ON match_record_slot (character_id);
