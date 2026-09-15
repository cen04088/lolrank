package com.lolrank.room;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/** 서버가 뜰 때 기본 방이 항상 존재하도록 보장한다. */
@Component
public class DefaultRoomInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DefaultRoomInitializer.class);

    private final RoomService roomService;

    public DefaultRoomInitializer(RoomService roomService) {
        this.roomService = roomService;
    }

    @Override
    public void run(ApplicationArguments args) {
        Room room = roomService.getOrCreateDefaultRoom();
        log.info("Default room ready: {} ({})", room.getName(), room.getInviteCode());
    }
}
