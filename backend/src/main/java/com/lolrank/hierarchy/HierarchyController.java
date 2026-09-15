package com.lolrank.hierarchy;

import com.lolrank.character.dto.CharacterResponse;
import com.lolrank.common.web.Nicknames;
import com.lolrank.hierarchy.dto.UpdateHierarchyRequest;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/rooms/{inviteCode}/hierarchy")
public class HierarchyController {

    private final HierarchyService hierarchyService;

    public HierarchyController(HierarchyService hierarchyService) {
        this.hierarchyService = hierarchyService;
    }

    @PutMapping
    public List<CharacterResponse> update(@PathVariable String inviteCode,
                                          @Valid @RequestBody UpdateHierarchyRequest request,
                                          @RequestHeader(value = Nicknames.HEADER, required = false) String nickname) {
        return hierarchyService.update(inviteCode, request.entries(), Nicknames.resolve(nickname));
    }
}
