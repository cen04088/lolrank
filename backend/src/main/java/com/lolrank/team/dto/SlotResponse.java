package com.lolrank.team.dto;

import com.lolrank.character.Position;
import com.lolrank.team.AssignmentSource;
import com.lolrank.team.Team;
import com.lolrank.team.TeamSlot;

public record SlotResponse(Team team, Position position, Long characterId, AssignmentSource source) {

    public static SlotResponse from(TeamSlot slot) {
        return new SlotResponse(slot.getTeam(), slot.getPosition(), slot.getCharacterId(), slot.getAssignmentSource());
    }
}
