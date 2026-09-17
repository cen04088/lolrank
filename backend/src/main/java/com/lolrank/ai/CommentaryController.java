package com.lolrank.ai;

import com.lolrank.ai.dto.AiStatusResponse;
import com.lolrank.ai.dto.CommentaryResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class CommentaryController {

    private final CommentaryService commentaryService;

    public CommentaryController(CommentaryService commentaryService) {
        this.commentaryService = commentaryService;
    }

    /** AI 기능 사용 가능 여부 (키가 없으면 commentary=false) */
    @GetMapping("/ai/status")
    public AiStatusResponse status() {
        return commentaryService.status();
    }

    /** 현재 보드에 대한 장로의 경기 전 해설. 같은 배치는 캐시된 결과를 돌려준다. */
    @PostMapping("/rooms/{inviteCode}/team-board/commentary")
    public CommentaryResponse commentary(@PathVariable String inviteCode) {
        return commentaryService.commentary(inviteCode);
    }
}
