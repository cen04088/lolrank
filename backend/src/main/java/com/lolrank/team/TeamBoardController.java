package com.lolrank.team;

import com.lolrank.common.web.Nicknames;
import com.lolrank.team.dto.TeamBoardResponse;
import com.lolrank.team.dto.UpdateParticipantsRequest;
import com.lolrank.team.dto.UpdateTeamBoardRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/rooms/{inviteCode}")
public class TeamBoardController {

    private final TeamBoardService teamBoardService;

    public TeamBoardController(TeamBoardService teamBoardService) {
        this.teamBoardService = teamBoardService;
    }

    @GetMapping("/team-board")
    public TeamBoardResponse getBoard(@PathVariable String inviteCode) {
        return teamBoardService.getBoard(inviteCode);
    }

    @PutMapping("/participants")
    public TeamBoardResponse updateParticipants(@PathVariable String inviteCode,
                                                @Valid @RequestBody UpdateParticipantsRequest request,
                                                @RequestHeader(value = Nicknames.HEADER, required = false) String nickname) {
        return teamBoardService.updateParticipants(inviteCode, request.characterIds(), Nicknames.resolve(nickname));
    }

    @PutMapping("/team-board")
    public TeamBoardResponse updateBoard(@PathVariable String inviteCode,
                                         @Valid @RequestBody UpdateTeamBoardRequest request,
                                         @RequestHeader(value = Nicknames.HEADER, required = false) String nickname) {
        return teamBoardService.updateBoard(inviteCode, request, Nicknames.resolve(nickname));
    }

    @PostMapping("/team-board/auto-fill")
    public TeamBoardResponse autoFill(@PathVariable String inviteCode,
                                      @RequestHeader(value = Nicknames.HEADER, required = false) String nickname) {
        return teamBoardService.autoFill(inviteCode, Nicknames.resolve(nickname));
    }
}
