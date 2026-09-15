package com.lolrank.character;

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
import org.hibernate.annotations.UpdateTimestamp;

/**
 * 친구 한 명 = 캐릭터 한 명.
 * 클래스 이름은 java.lang.Character 와의 충돌을 피하기 위해 PlayerCharacter 로 둔다.
 */
@Entity
@Table(name = "player_character")
public class PlayerCharacter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @Column(nullable = false, length = 20)
    private String name;

    @Column(length = 100)
    private String description;

    @Column(name = "asset_key", nullable = false, length = 40)
    private String assetKey;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Tier tier;

    @Column
    private Integer division;

    @Enumerated(EnumType.STRING)
    @Column(name = "main_position", nullable = false, length = 10)
    private Position mainPosition;

    @Enumerated(EnumType.STRING)
    @Column(name = "sub_position", length = 10)
    private Position subPosition;

    @Enumerated(EnumType.STRING)
    @Column(name = "hierarchy_rank", nullable = false, length = 10)
    private HierarchyRank hierarchyRank;

    @Column(name = "hierarchy_order", nullable = false)
    private int hierarchyOrder;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected PlayerCharacter() {
    }

    public PlayerCharacter(Room room, String name, String description, String assetKey,
                           Tier tier, Integer division, Position mainPosition, Position subPosition,
                           HierarchyRank hierarchyRank, int hierarchyOrder) {
        this.room = room;
        this.name = name;
        this.description = description;
        this.assetKey = assetKey;
        this.tier = tier;
        this.division = division;
        this.mainPosition = mainPosition;
        this.subPosition = subPosition;
        this.hierarchyRank = hierarchyRank;
        this.hierarchyOrder = hierarchyOrder;
    }

    public void updateProfile(String name, String description, String assetKey,
                              Tier tier, Integer division, Position mainPosition, Position subPosition) {
        this.name = name;
        this.description = description;
        this.assetKey = assetKey;
        this.tier = tier;
        this.division = division;
        this.mainPosition = mainPosition;
        this.subPosition = subPosition;
    }

    public void moveHierarchy(HierarchyRank rank, int order) {
        this.hierarchyRank = rank;
        this.hierarchyOrder = order;
    }

    public boolean belongsTo(Room other) {
        return room.getId().equals(other.getId());
    }

    public Long getId() {
        return id;
    }

    public Room getRoom() {
        return room;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public String getAssetKey() {
        return assetKey;
    }

    public Tier getTier() {
        return tier;
    }

    public Integer getDivision() {
        return division;
    }

    public Position getMainPosition() {
        return mainPosition;
    }

    public Position getSubPosition() {
        return subPosition;
    }

    public HierarchyRank getHierarchyRank() {
        return hierarchyRank;
    }

    public int getHierarchyOrder() {
        return hierarchyOrder;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
