package com.lolrank.room;

import com.lolrank.common.exception.NotFoundException;
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

    /** 단일 방 모드의 기본 방. 없으면 만든다 (기동 시 한 번 호출되고, 이후엔 조회만). */
    @Transactional
    public Room getOrCreateDefaultRoom() {
        return roomRepository.findByInviteCode(defaultRoomCode)
                .orElseGet(() -> roomRepository.save(new Room(defaultRoomName, defaultRoomCode)));
    }

    @Transactional
    public Room create(String name) {
        String code = nextUniqueCode();
        return roomRepository.save(new Room(name.strip(), code));
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
