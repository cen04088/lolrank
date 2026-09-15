package com.lolrank.room;

import com.lolrank.common.exception.NotFoundException;
import com.lolrank.room.dto.RoomSummaryResponse;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class RoomService {

    private static final int MAX_CODE_ATTEMPTS = 20;

    private final RoomRepository roomRepository;
    private final InviteCodeGenerator inviteCodeGenerator;
    private final String defaultRoomCode;
    private final String defaultRoomName;

    public RoomService(RoomRepository roomRepository,
                       InviteCodeGenerator inviteCodeGenerator,
                       @Value("${app.default-room.code}") String defaultRoomCode,
                       @Value("${app.default-room.name}") String defaultRoomName) {
        this.roomRepository = roomRepository;
        this.inviteCodeGenerator = inviteCodeGenerator;
        this.defaultRoomCode = defaultRoomCode.strip().toUpperCase();
        this.defaultRoomName = defaultRoomName;
    }

    /**
     * 단일 방 모드의 기본 방. 없으면 만들고, 설정된 이름과 다르면 이름을 맞춘다
     * (APP_DEFAULT_ROOM_NAME 만 바꿔서 방 이름을 변경할 수 있게).
     */
    @Transactional
    public Room getOrCreateDefaultRoom() {
        Room room = roomRepository.findByInviteCode(defaultRoomCode)
                .orElseGet(() -> roomRepository.save(new Room(defaultRoomName, defaultRoomCode)));
        if (!room.getName().equals(defaultRoomName)) {
            room.rename(defaultRoomName);
        }
        return room;
    }

    @Transactional
    public Room create(String name) {
        String code = nextUniqueCode();
        return roomRepository.save(new Room(name.strip(), code));
    }

    /** 모든 방과 캐릭터 수. 데이터가 어느 방에 있는지 찾을 때 쓴다. */
    public List<RoomSummaryResponse> listSummaries() {
        return roomRepository.findAllSummaries();
    }

    public Room getByInviteCode(String inviteCode) {
        return roomRepository.findByInviteCode(inviteCode.strip().toUpperCase())
                .orElseThrow(() -> new NotFoundException("존재하지 않는 방입니다: " + inviteCode));
    }

    private String nextUniqueCode() {
        for (int i = 0; i < MAX_CODE_ATTEMPTS; i++) {
            String code = inviteCodeGenerator.generate();
            if (!roomRepository.existsByInviteCode(code)) {
                return code;
            }
        }
        throw new IllegalStateException("초대 코드를 생성하지 못했습니다.");
    }
}
