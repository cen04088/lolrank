package com.lolrank.team;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TeamParticipantRepository extends JpaRepository<TeamParticipant, Long> {

    List<TeamParticipant> findAllByRoomId(Long roomId);

    @Query("select p from TeamParticipant p where p.character.id = :characterId")
    List<TeamParticipant> findAllByCharacterId(@Param("characterId") Long characterId);
}
