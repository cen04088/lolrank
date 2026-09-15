package com.lolrank.changelog;

import com.lolrank.changelog.dto.ChangeLogResponse;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/rooms/{inviteCode}/change-logs")
public class ChangeLogController {

    private final ChangeLogService changeLogService;

    public ChangeLogController(ChangeLogService changeLogService) {
        this.changeLogService = changeLogService;
    }

    @GetMapping
    public List<ChangeLogResponse> list(@PathVariable String inviteCode,
                                        @RequestParam(defaultValue = "" + ChangeLogService.DEFAULT_LIMIT) int limit) {
        return changeLogService.list(inviteCode, limit);
    }
}
