-- 주로 하는 챔피언 (자유 입력, 쉼표 구분. 예: '가렌, 다리우스, 오른')
ALTER TABLE player_character ADD COLUMN champions VARCHAR(60);
