-- 부 포지션을 여러 개 저장한다 (콤마 구분, 예: 'MID,ADC')
ALTER TABLE player_character RENAME COLUMN sub_position TO sub_positions;
ALTER TABLE player_character ALTER COLUMN sub_positions TYPE VARCHAR(60);
