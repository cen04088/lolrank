package com.lolrank.room;

import com.lolrank.room.dto.CreateRoomRequest;
import com.lolrank.room.dto.RoomResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RoomResponse create(@Valid @RequestBody CreateRoomRequest request) {
        return RoomResponse.from(roomService.create(request.name()));
    }

    @GetMapping("/{inviteCode}")
    public RoomResponse get(@PathVariable String inviteCode) {
        return RoomResponse.from(roomService.getByInviteCode(inviteCode));
    }
}
