package com.lolrank.character;

import com.lolrank.character.dto.CharacterResponse;
import com.lolrank.character.dto.CreateCharacterRequest;
import com.lolrank.character.dto.UpdateCharacterRequest;
import com.lolrank.common.web.Nicknames;
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
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class CharacterController {

    private final CharacterService characterService;

    public CharacterController(CharacterService characterService) {
        this.characterService = characterService;
    }

    @GetMapping("/rooms/{inviteCode}/characters")
    public List<CharacterResponse> list(@PathVariable String inviteCode) {
        return characterService.list(inviteCode);
    }

    @PostMapping("/rooms/{inviteCode}/characters")
    @ResponseStatus(HttpStatus.CREATED)
    public CharacterResponse create(@PathVariable String inviteCode,
                                    @Valid @RequestBody CreateCharacterRequest request,
                                    @RequestHeader(value = Nicknames.HEADER, required = false) String nickname) {
        return characterService.create(inviteCode, request, Nicknames.resolve(nickname));
    }

    @PatchMapping("/characters/{characterId}")
    public CharacterResponse update(@PathVariable Long characterId,
                                    @Valid @RequestBody UpdateCharacterRequest request,
                                    @RequestHeader(value = Nicknames.HEADER, required = false) String nickname) {
        return characterService.update(characterId, request, Nicknames.resolve(nickname));
    }

    @DeleteMapping("/characters/{characterId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long characterId,
                       @RequestHeader(value = Nicknames.HEADER, required = false) String nickname) {
        characterService.delete(characterId, Nicknames.resolve(nickname));
    }
}
