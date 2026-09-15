package com.lolrank.room.dto;

import java.time.Instant;

/** 방 목록용 요약. 캐릭터 수로 어떤 방에 데이터가 있는지 바로 알 수 있다. */
public record RoomSummaryResponse(Long id, String name, String inviteCode, long characterCount, Instant createdAt) {
}
