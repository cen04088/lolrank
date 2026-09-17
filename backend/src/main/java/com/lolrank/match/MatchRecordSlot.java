package com.lolrank.match;

import com.lolrank.character.HierarchyRank;
import com.lolrank.character.PlayerCharacter;
import com.lolrank.character.Position;
import com.lolrank.character.Tier;
import com.lolrank.team.Team;
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

/** 기록 당시 한 자리의 스냅샷. 캐릭터가 바뀌거나 지워져도 그대로 남는다. */
@Entity
@Table(name = "match_record_slot")
public class MatchRecordSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "match_id", nullable = false)
    private MatchRecord record;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Team team;

    @Enumerated(EnumType.STRING)
    @Column(name = "board_position", nullable = false, length = 10)
    private Position position;

    /** 원본 캐릭터. 삭제되면 null (DB ON DELETE SET NULL) */
    @Column(name = "character_id")
    private Long characterId;

    @Column(name = "character_name", nullable = false, length = 20)
    private String characterName;

    @Column(length = 20)
    private String title;

    @Column(name = "asset_key", nullable = false, length = 40)
    private String assetKey;

    @Enumerated(EnumType.STRING)
    @Column(name = "hierarchy_rank", nullable = false, length = 10)
    private HierarchyRank hierarchyRank;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Tier tier;

    private Integer division;

    /** 기록 당시 전투력 (StrengthCalculator ×100 단위) */
    @Column(nullable = false)
    private int strength;

    protected MatchRecordSlot() {
    }

    public MatchRecordSlot(MatchRecord record, Team team, Position position, PlayerCharacter c, int strength) {
        this.record = record;
        this.team = team;
        this.position = position;
        this.characterId = c.getId();
        this.characterName = c.getName();
        this.title = c.getTitle();
        this.assetKey = c.getAssetKey();
        this.hierarchyRank = c.getHierarchyRank();
        this.tier = c.getTier();
        this.division = c.getDivision();
        this.strength = strength;
    }

    public Team getTeam() {
        return team;
    }

    public Position getPosition() {
        return position;
    }

    public Long getCharacterId() {
        return characterId;
    }

    public String getCharacterName() {
        return characterName;
    }

    public String getTitle() {
        return title;
    }

    public String getAssetKey() {
        return assetKey;
    }

    public HierarchyRank getHierarchyRank() {
        return hierarchyRank;
    }

    public Tier getTier() {
        return tier;
    }

    public Integer getDivision() {
        return division;
    }

    public int getStrength() {
        return strength;
    }
}
