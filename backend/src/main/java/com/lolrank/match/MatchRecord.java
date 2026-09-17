package com.lolrank.match;

import com.lolrank.room.Room;
import com.lolrank.team.Team;
import com.lolrank.team.balance.BalanceGrade;
import jakarta.persistence.CascadeType;
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
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

/** 한 경기의 조합 스냅샷 + 결과. 밸런스 보정의 원천 데이터. */
@Entity
@Table(name = "match_record")
public class MatchRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @Column(name = "played_at", nullable = false)
    private Instant playedAt;

    /** 승리 팀. 아직 모르면 null */
    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private Team winner;

    @Column(length = 100)
    private String note;

    @Column(name = "recorded_by", nullable = false, length = 20)
    private String recordedBy;

    @Column(name = "blue_score", nullable = false)
    private int blueScore;

    @Column(name = "red_score", nullable = false)
    private int redScore;

    @Column(nullable = false)
    private int difference;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BalanceGrade grade;

    @OneToMany(mappedBy = "record", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("team ASC, position ASC")
    private List<MatchRecordSlot> slots = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected MatchRecord() {
    }

    public MatchRecord(Room room, Team winner, String note, String recordedBy,
                       int blueScore, int redScore, int difference, BalanceGrade grade) {
        this.room = room;
        this.playedAt = Instant.now();
        this.winner = winner;
        this.note = note;
        this.recordedBy = recordedBy;
        this.blueScore = blueScore;
        this.redScore = redScore;
        this.difference = difference;
        this.grade = grade;
    }

    public void addSlot(MatchRecordSlot slot) {
        slots.add(slot);
    }

    public void changeResult(Team winner, String note) {
        this.winner = winner;
        this.note = note;
    }

    public Long getId() {
        return id;
    }

    public Room getRoom() {
        return room;
    }

    public Instant getPlayedAt() {
        return playedAt;
    }

    public Team getWinner() {
        return winner;
    }

    public String getNote() {
        return note;
    }

    public String getRecordedBy() {
        return recordedBy;
    }

    public int getBlueScore() {
        return blueScore;
    }

    public int getRedScore() {
        return redScore;
    }

    public int getDifference() {
        return difference;
    }

    public BalanceGrade getGrade() {
        return grade;
    }

    public List<MatchRecordSlot> getSlots() {
        return slots;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
