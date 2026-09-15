package com.lolrank.room;

import com.lolrank.room.dto.RoomSummaryResponse;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface RoomRepository extends JpaRepository<Room, Long> {

    @Query("""
            select new com.lolrank.room.dto.RoomSummaryResponse(
                r.id, r.name, r.inviteCode,
                (select count(c) from PlayerCharacter c where c.room = r),
                r.createdAt)
            from Room r
            order by r.id
            """)
    List<RoomSummaryResponse> findAllSummaries();

    Optional<Room> findByInviteCode(String inviteCode);

    boolean existsByInviteCode(String inviteCode);
}
