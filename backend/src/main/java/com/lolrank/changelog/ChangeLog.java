package com.lolrank.changelog;

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
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "change_log")
public class ChangeLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    /** 캐릭터가 삭제되어도 기록은 남아야 하므로 연관관계 대신 id + 이름 스냅샷을 저장한다. */
    @Column(name = "character_id")
    private Long characterId;

    @Column(name = "character_name", length = 20)
    private String characterName;

    @Column(nullable = false, length = 20)
    private String nickname;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ChangeLogAction action;

    @Column(nullable = false, length = 200)
    private String message;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "before_data")
    private String beforeData;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "after_data")
    private String afterData;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected ChangeLog() {
    }

    public ChangeLog(Room room, Long characterId, String characterName, String nickname,
                     ChangeLogAction action, String message, String beforeData, String afterData) {
        this.room = room;
        this.characterId = characterId;
        this.characterName = characterName;
        this.nickname = nickname;
        this.action = action;
        this.message = message;
        this.beforeData = beforeData;
        this.afterData = afterData;
    }

    public Long getId() {
        return id;
    }

    public Room getRoom() {
        return room;
    }

    public Long getCharacterId() {
        return characterId;
    }

    public String getCharacterName() {
        return characterName;
    }

    public String getNickname() {
        return nickname;
    }

    public ChangeLogAction getAction() {
        return action;
    }

    public String getMessage() {
        return message;
    }

    public String getBeforeData() {
        return beforeData;
    }

    public String getAfterData() {
        return afterData;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
