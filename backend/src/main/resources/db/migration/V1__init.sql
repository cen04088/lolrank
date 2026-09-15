-- LOL RANK 초기 스키마

CREATE TABLE room (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(40)  NOT NULL,
    invite_code VARCHAR(12)  NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT uq_room_invite_code UNIQUE (invite_code)
);

-- "character" 는 SQL 예약어이므로 player_character 로 명명
CREATE TABLE player_character (
    id              BIGSERIAL PRIMARY KEY,
    room_id         BIGINT       NOT NULL REFERENCES room (id) ON DELETE CASCADE,
    name            VARCHAR(20)  NOT NULL,
    description     VARCHAR(100),
    asset_key       VARCHAR(40)  NOT NULL,
    tier            VARCHAR(20)  NOT NULL,
    division        INTEGER,
    main_position   VARCHAR(10)  NOT NULL,
    sub_position    VARCHAR(10),
    hierarchy_rank  VARCHAR(10)  NOT NULL,
    hierarchy_order INTEGER      NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT chk_player_character_division CHECK (division IS NULL OR division BETWEEN 1 AND 4)
);

CREATE INDEX idx_player_character_room ON player_character (room_id);

CREATE TABLE team_participant (
    id           BIGSERIAL PRIMARY KEY,
    room_id      BIGINT      NOT NULL REFERENCES room (id) ON DELETE CASCADE,
    character_id BIGINT      NOT NULL REFERENCES player_character (id) ON DELETE CASCADE,
    selected     BOOLEAN     NOT NULL DEFAULT TRUE,
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_team_participant UNIQUE (room_id, character_id)
);

CREATE TABLE team_slot (
    id                BIGSERIAL PRIMARY KEY,
    room_id           BIGINT      NOT NULL REFERENCES room (id) ON DELETE CASCADE,
    team              VARCHAR(10) NOT NULL,
    board_position    VARCHAR(10) NOT NULL,
    character_id      BIGINT      REFERENCES player_character (id) ON DELETE SET NULL,
    assignment_source VARCHAR(10),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_team_slot UNIQUE (room_id, team, board_position),
    -- SWAP 시 한 트랜잭션 안에서 두 슬롯이 바뀌므로 커밋 시점에 검사한다.
    CONSTRAINT uq_team_slot_character UNIQUE (room_id, character_id) DEFERRABLE INITIALLY DEFERRED
);

CREATE TABLE change_log (
    id             BIGSERIAL PRIMARY KEY,
    room_id        BIGINT       NOT NULL REFERENCES room (id) ON DELETE CASCADE,
    character_id   BIGINT       REFERENCES player_character (id) ON DELETE SET NULL,
    character_name VARCHAR(20),
    nickname       VARCHAR(20)  NOT NULL,
    action         VARCHAR(30)  NOT NULL,
    message        VARCHAR(200) NOT NULL,
    before_data    JSONB,
    after_data     JSONB,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_change_log_room_created ON change_log (room_id, created_at DESC);
