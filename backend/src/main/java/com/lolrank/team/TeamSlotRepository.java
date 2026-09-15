package com.lolrank.team;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TeamSlotRepository extends JpaRepository<TeamSlot, Long> {

    List<TeamSlot> findAllByRoomId(Long roomId);

    @Query("select s from TeamSlot s where s.character.id = :characterId")
    List<TeamSlot> findAllByCharacterId(@Param("characterId") Long characterId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("delete from TeamSlot e where e.room.id = :roomId")
    int deleteAllByRoomId(@Param("roomId") Long roomId);
}
