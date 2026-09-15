package com.lolrank.team;

import com.lolrank.character.PlayerCharacter;
import com.lolrank.character.Position;
import com.lolrank.room.Room;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import org.hibernate.annotations.UpdateTimestamp;

/** 팀 보드의 한 칸. 방마다 (team, position) 조합 10개가 항상 존재한다. */
@Entity
@Table(name = "team_slot")
public class TeamSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Team team;

    @Enumerated(EnumType.STRING)
    @Column(name = "board_position", nullable = false, length = 10)
    private Position position;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "character_id")
    private PlayerCharacter character;

    @Enumerated(EnumType.STRING)
    @Column(name = "assignment_source", length = 10)
    private AssignmentSource assignmentSource;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected TeamSlot() {
    }

    public TeamSlot(Room room, Team team, Position position) {
        this.room = room;
        this.team = team;
        this.position = position;
    }

    public void assign(PlayerCharacter character, AssignmentSource source) {
        this.character = character;
        this.assignmentSource = source;
    }

    public void clear() {
        this.character = null;
        this.assignmentSource = null;
    }

    public boolean isEmpty() {
        return character == null;
    }

    public boolean isManual() {
        return character != null && assignmentSource == AssignmentSource.MANUAL;
    }

    public boolean isAuto() {
        return character != null && assignmentSource == AssignmentSource.AUTO;
    }

    public Long getCharacterId() {
        return character != null ? character.getId() : null;
    }

    public Long getId() {
        return id;
    }

    public Room getRoom() {
        return room;
    }

    public Team getTeam() {
        return team;
    }

    public Position getPosition() {
        return position;
    }

    public PlayerCharacter getCharacter() {
        return character;
    }

    public AssignmentSource getAssignmentSource() {
        return assignmentSource;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
