package com.lolrank.match;

import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MatchRecordRepository extends JpaRepository<MatchRecord, Long> {

    List<MatchRecord> findAllByRoomIdOrderByPlayedAtDescIdDesc(Long roomId, Pageable pageable);

    long countByRoomId(Long roomId);

    @Modifying(clearAutomatically = true)
    @Query("delete from MatchRecordSlot s where s.record.id in (select r.id from MatchRecord r where r.room.id = :roomId)")
    void deleteAllSlotsByRoomId(@Param("roomId") Long roomId);

    @Modifying(clearAutomatically = true)
    @Query("delete from MatchRecord r where r.room.id = :roomId")
    void deleteAllByRoomId(@Param("roomId") Long roomId);
}
