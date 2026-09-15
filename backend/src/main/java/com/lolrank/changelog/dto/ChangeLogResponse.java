package com.lolrank.changelog.dto;

import com.lolrank.changelog.ChangeLog;
import com.lolrank.changelog.ChangeLogAction;
import java.time.Instant;

public record ChangeLogResponse(
        Long id,
        Long characterId,
        String characterName,
        String nickname,
        ChangeLogAction action,
        String message,
        Instant createdAt
) {

    public static ChangeLogResponse from(ChangeLog log) {
        return new ChangeLogResponse(
                log.getId(),
                log.getCharacterId(),
                log.getCharacterName(),
                log.getNickname(),
                log.getAction(),
                log.getMessage(),
                log.getCreatedAt()
        );
    }
}
