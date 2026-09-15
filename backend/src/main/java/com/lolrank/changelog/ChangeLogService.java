package com.lolrank.changelog;

import com.lolrank.changelog.dto.ChangeLogResponse;
import com.lolrank.character.PlayerCharacter;
import com.lolrank.room.Room;
import com.lolrank.room.RoomService;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

@Service
@Transactional(readOnly = true)
public class ChangeLogService {

    public static final int DEFAULT_LIMIT = 50;
    public static final int MAX_LIMIT = 200;
    private static final int MAX_MESSAGE_LENGTH = 200;

    private final ChangeLogRepository changeLogRepository;
    private final RoomService roomService;
    private final ObjectMapper objectMapper;

    public ChangeLogService(ChangeLogRepository changeLogRepository,
                            RoomService roomService,
                            ObjectMapper objectMapper) {
        this.changeLogRepository = changeLogRepository;
        this.roomService = roomService;
        this.objectMapper = objectMapper;
    }

    /**
     * 변경 기록을 남긴다. 호출한 트랜잭션 안에서 함께 커밋된다.
     *
     * @param character 대상 캐릭터 (없으면 null)
     * @param before    변경 전 스냅샷 (JSON 직렬화 가능한 객체, 없으면 null)
     * @param after     변경 후 스냅샷 (JSON 직렬화 가능한 객체, 없으면 null)
     */
    @Transactional
    public void record(Room room, PlayerCharacter character, String nickname, ChangeLogAction action,
                       Object before, Object after, String message) {
        changeLogRepository.save(new ChangeLog(
                room,
                character != null ? character.getId() : null,
                character != null ? character.getName() : null,
                nickname,
                action,
                truncate(message),
                toJson(before),
                toJson(after)
        ));
    }

    public List<ChangeLogResponse> list(String inviteCode, int limit) {
        Room room = roomService.getByInviteCode(inviteCode);
        int size = Math.max(1, Math.min(limit, MAX_LIMIT));
        return changeLogRepository.findAllByRoomIdOrderByCreatedAtDescIdDesc(room.getId(), PageRequest.of(0, size))
                .stream()
                .map(ChangeLogResponse::from)
                .toList();
    }

    private String toJson(Object value) {
        if (value == null) {
            return null;
        }
        return objectMapper.writeValueAsString(value);
    }

    private static String truncate(String message) {
        if (message == null) {
            return "";
        }
        return message.length() > MAX_MESSAGE_LENGTH ? message.substring(0, MAX_MESSAGE_LENGTH) : message;
    }
}
