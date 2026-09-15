package com.lolrank.room.dto;

import com.lolrank.room.Room;
import java.time.Instant;

public record RoomResponse(Long id, String name, String inviteCode, Instant createdAt) {

    public static RoomResponse from(Room room) {
        return new RoomResponse(room.getId(), room.getName(), room.getInviteCode(), room.getCreatedAt());
    }
}
