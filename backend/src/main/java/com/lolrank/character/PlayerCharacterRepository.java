package com.lolrank.character;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PlayerCharacterRepository extends JpaRepository<PlayerCharacter, Long> {

    List<PlayerCharacter> findAllByRoomIdOrderByIdAsc(Long roomId);

    List<PlayerCharacter> findAllByRoomIdAndIdIn(Long roomId, Collection<Long> ids);

    @Query("select max(c.hierarchyOrder) from PlayerCharacter c where c.room.id = :roomId and c.hierarchyRank = :rank")
    Optional<Integer> findMaxHierarchyOrder(@Param("roomId") Long roomId, @Param("rank") HierarchyRank rank);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("delete from PlayerCharacter e where e.room.id = :roomId")
    int deleteAllByRoomId(@Param("roomId") Long roomId);
}
