package com.lolrank.changelog;

import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ChangeLogRepository extends JpaRepository<ChangeLog, Long> {

    List<ChangeLog> findAllByRoomIdOrderByCreatedAtDescIdDesc(Long roomId, Pageable pageable);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("delete from ChangeLog e where e.room.id = :roomId")
    int deleteAllByRoomId(@Param("roomId") Long roomId);
}
