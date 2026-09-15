package com.lolrank.changelog;

import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChangeLogRepository extends JpaRepository<ChangeLog, Long> {

    List<ChangeLog> findAllByRoomIdOrderByCreatedAtDescIdDesc(Long roomId, Pageable pageable);
}
