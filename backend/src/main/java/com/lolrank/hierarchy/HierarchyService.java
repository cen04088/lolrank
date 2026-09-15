package com.lolrank.hierarchy;

import com.lolrank.changelog.ChangeLogAction;
import com.lolrank.changelog.ChangeLogService;
import com.lolrank.character.HierarchyRank;
import com.lolrank.character.PlayerCharacter;
import com.lolrank.character.PlayerCharacterRepository;
import com.lolrank.character.dto.CharacterResponse;
import com.lolrank.common.exception.BadRequestException;
import com.lolrank.hierarchy.dto.HierarchyEntry;
import com.lolrank.room.Room;
import com.lolrank.room.RoomService;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class HierarchyService {

    private final PlayerCharacterRepository characterRepository;
    private final RoomService roomService;
    private final ChangeLogService changeLogService;

    public HierarchyService(PlayerCharacterRepository characterRepository,
                            RoomService roomService,
                            ChangeLogService changeLogService) {
        this.characterRepository = characterRepository;
        this.roomService = roomService;
        this.changeLogService = changeLogService;
    }

    /** 계급/순서를 한 번에 반영한다. 목록에 없는 캐릭터는 그대로 둔다. */
    @Transactional
    public List<CharacterResponse> update(String inviteCode, List<HierarchyEntry> entries, String nickname) {
        Room room = roomService.getByInviteCode(inviteCode);
        Set<Long> ids = new HashSet<>();
        for (HierarchyEntry entry : entries) {
            if (!ids.add(entry.characterId())) {
                throw new BadRequestException("같은 캐릭터가 중복되었습니다.");
            }
        }

        Map<Long, PlayerCharacter> charactersById = ids.isEmpty()
                ? Map.of()
                : characterRepository.findAllByRoomIdAndIdIn(room.getId(), ids).stream()
                        .collect(Collectors.toMap(PlayerCharacter::getId, Function.identity()));
        if (charactersById.size() != ids.size()) {
            throw new BadRequestException("이 방에 없는 캐릭터가 포함되어 있습니다.");
        }

        List<String> rankChanges = new ArrayList<>();
        PlayerCharacter changedCharacter = null;
        for (HierarchyEntry entry : entries) {
            PlayerCharacter character = charactersById.get(entry.characterId());
            HierarchyRank beforeRank = character.getHierarchyRank();
            character.moveHierarchy(entry.rank(), entry.order());
            if (beforeRank != entry.rank()) {
                rankChanges.add(character.getName() + "의 계급을 " + beforeRank + " → " + entry.rank());
                changedCharacter = character;
            }
        }

        String message = buildMessage(nickname, rankChanges);
        changeLogService.record(room, rankChanges.size() == 1 ? changedCharacter : null, nickname,
                ChangeLogAction.HIERARCHY_UPDATED, null, entries, message);

        return characterRepository.findAllByRoomIdOrderByIdAsc(room.getId()).stream()
                .map(CharacterResponse::from)
                .toList();
    }

    private static String buildMessage(String nickname, List<String> rankChanges) {
        if (rankChanges.isEmpty()) {
            return nickname + "님이 계급도 순서를 변경했습니다.";
        }
        if (rankChanges.size() == 1) {
            return nickname + "님이 " + rankChanges.get(0) + "(으)로 변경했습니다.";
        }
        return nickname + "님이 계급도를 변경했습니다. (" + rankChanges.size() + "명 이동)";
    }
}
