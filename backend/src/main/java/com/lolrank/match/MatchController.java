package com.lolrank.match;

import com.lolrank.common.web.Nicknames;
import com.lolrank.match.dto.MatchResponse;
import com.lolrank.match.dto.RecordMatchRequest;
import com.lolrank.match.dto.UpdateMatchRequest;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class MatchController {

    private final MatchService matchService;

    public MatchController(MatchService matchService) {
        this.matchService = matchService;
    }

    /** 현재 팀 보드를 경기 기록으로 남긴다 (10자리 모두 필요). */
    @PostMapping("/rooms/{inviteCode}/matches")
    @ResponseStatus(HttpStatus.CREATED)
    public MatchResponse record(@PathVariable String inviteCode,
                                @Valid @RequestBody(required = false) RecordMatchRequest request,
                                @RequestHeader(value = Nicknames.HEADER, required = false) String nickname) {
        RecordMatchRequest body = request != null ? request : new RecordMatchRequest(null, null);
        return matchService.record(inviteCode, body, Nicknames.resolve(nickname));
    }

    @GetMapping("/rooms/{inviteCode}/matches")
    public List<MatchResponse> list(@PathVariable String inviteCode,
                                    @RequestParam(defaultValue = "50") int limit) {
        return matchService.list(inviteCode, limit);
    }

    /** 승패/메모 수정. winner 를 비우면 '미정' */
    @PatchMapping("/matches/{matchId}")
    public MatchResponse update(@PathVariable Long matchId,
                                @Valid @RequestBody UpdateMatchRequest request,
                                @RequestHeader(value = Nicknames.HEADER, required = false) String nickname) {
        return matchService.update(matchId, request, Nicknames.resolve(nickname));
    }

    @DeleteMapping("/matches/{matchId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long matchId,
                       @RequestHeader(value = Nicknames.HEADER, required = false) String nickname) {
        matchService.delete(matchId, Nicknames.resolve(nickname));
    }
}
