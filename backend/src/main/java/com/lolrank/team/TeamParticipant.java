package com.lolrank.team;

import com.lolrank.character.PlayerCharacter;
import com.lolrank.room.Room;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import org.hibernate.annotations.UpdateTimestamp;

/** "오늘의 참가자" 선택 상태. */
@Entity
@Table(name = "team_participant")
public class TeamParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "character_id", nullable = false)
    private PlayerCharacter character;

    @Column(nullable = false)
    private boolean selected;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected TeamParticipant() {
    }

    public TeamParticipant(Room room, PlayerCharacter character, boolean selected) {
        this.room = room;
        this.character = character;
        this.selected = selected;
    }

    public void setSelected(boolean selected) {
        this.selected = selected;
    }

    public Long getId() {
        return id;
    }

    public Room getRoom() {
        return room;
    }

    public PlayerCharacter getCharacter() {
        return character;
    }

    public boolean isSelected() {
        return selected;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
