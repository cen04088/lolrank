package com.lolrank.character;

import com.lolrank.changelog.ChangeLogAction;
import com.lolrank.changelog.ChangeLogService;
import com.lolrank.character.dto.CharacterResponse;
import com.lolrank.character.dto.CreateCharacterRequest;
import com.lolrank.character.dto.UpdateCharacterRequest;
import com.lolrank.common.exception.BadRequestException;
import com.lolrank.common.exception.NotFoundException;
import com.lolrank.room.Room;
import com.lolrank.room.RoomService;
import com.lolrank.team.TeamBoardService;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class CharacterService {

    /** 새 캐릭터는 계급도의 가장 낮은 계급에서 시작한다. */
    private static final HierarchyRank DEFAULT_HIERARCHY_RANK = HierarchyRank.C;

    private final PlayerCharacterRepository characterRepository;
    private final RoomService roomService;
    private final TeamBoardService teamBoardService;
    private final ChangeLogService changeLogService;

    public CharacterService(PlayerCharacterRepository characterRepository,
                            RoomService roomService,
                            TeamBoardService teamBoardService,
                            ChangeLogService changeLogService) {
        this.characterRepository = characterRepository;
        this.roomService = roomService;
        this.teamBoardService = teamBoardService;
        this.changeLogService = changeLogService;
    }

    public List<CharacterResponse> list(String inviteCode) {
        Room room = roomService.getByInviteCode(inviteCode);
        return characterRepository.findAllByRoomIdOrderByIdAsc(room.getId()).stream()
                .map(CharacterResponse::from)
                .toList();
    }

    public PlayerCharacter getOrThrow(Long characterId) {
        return characterRepository.findById(characterId)
                .orElseThrow(() -> new NotFoundException("존재하지 않는 캐릭터입니다."));
    }

    @Transactional
    public CharacterResponse create(String inviteCode, CreateCharacterRequest request, String nickname) {
        Room room = roomService.getByInviteCode(inviteCode);
        Integer division = normalizeDivision(request.tier(), request.division());
        List<Position> subPositions = normalizeSubPositions(request.mainPosition(), request.subPositions());

        int order = characterRepository.findMaxHierarchyOrder(room.getId(), DEFAULT_HIERARCHY_RANK)
                .map(max -> max + 1)
                .orElse(0);

        PlayerCharacter character = new PlayerCharacter(
                room,
                request.name().strip(),
                blankToNull(request.description()),
                request.assetKey().strip(),
                request.tier(),
                division,
                request.mainPosition(),
                subPositions,
                DEFAULT_HIERARCHY_RANK,
                order
        );
        character.changeTitle(blankToNull(request.title()));
        PlayerCharacter saved = characterRepository.save(character);

        CharacterResponse response = CharacterResponse.from(saved);
        changeLogService.record(room, saved, nickname, ChangeLogAction.CHARACTER_CREATED,
                null, response, nickname + "님이 " + saved.getName() + " 캐릭터를 만들었습니다.");
        return response;
    }

    @Transactional
    public CharacterResponse update(Long characterId, UpdateCharacterRequest request, String nickname) {
        PlayerCharacter character = getOrThrow(characterId);
        CharacterResponse before = CharacterResponse.from(character);

        Tier tier = Objects.requireNonNullElse(request.tier(), character.getTier());
        Integer requestedDivision = request.division() != null ? request.division() : character.getDivision();
        Integer division = normalizeDivision(tier, requestedDivision);

        Position mainPosition = Objects.requireNonNullElse(request.mainPosition(), character.getMainPosition());
        List<Position> subPositions = normalizeSubPositions(mainPosition,
                request.subPositions() != null ? request.subPositions() : character.getSubPositions());

        if (request.title() != null) {
            character.changeTitle(blankToNull(request.title()));
        }
        character.updateProfile(
                request.name() != null ? request.name().strip() : character.getName(),
                request.description() != null ? blankToNull(request.description()) : character.getDescription(),
                request.assetKey() != null ? request.assetKey().strip() : character.getAssetKey(),
                tier,
                division,
                mainPosition,
                subPositions
        );

        CharacterResponse after = CharacterResponse.from(character);
        changeLogService.record(character.getRoom(), character, nickname, ChangeLogAction.CHARACTER_UPDATED,
                before, after, buildUpdateMessage(nickname, before, after));
        return after;
    }

    @Transactional
    public void delete(Long characterId, String nickname) {
        PlayerCharacter character = getOrThrow(characterId);
        Room room = character.getRoom();
        CharacterResponse before = CharacterResponse.from(character);

        teamBoardService.detachCharacter(character);
        characterRepository.delete(character);

        changeLogService.record(room, null, nickname, ChangeLogAction.CHARACTER_DELETED,
                before, null, nickname + "님이 " + before.name() + " 캐릭터를 삭제했습니다.");
    }

    private static Integer normalizeDivision(Tier tier, Integer division) {
        if (tier.hasDivision()) {
            if (!Division.isValid(division)) {
                throw new BadRequestException(tier.getDisplayName() + " 티어는 Division(1~4)이 필요합니다.");
            }
            return division;
        }
        return null;
    }

    /** 중복 제거, 주 포지션과 겹치면 거절. null 은 빈 목록. */
    private static List<Position> normalizeSubPositions(Position main, List<Position> subs) {
        if (subs == null) {
            return List.of();
        }
        LinkedHashSet<Position> unique = new LinkedHashSet<>();
        for (Position sub : subs) {
            if (sub == null) {
                continue;
            }
            if (sub == main) {
                throw new BadRequestException("부 포지션은 주 포지션과 달라야 합니다.");
            }
            unique.add(sub);
        }
        return List.copyOf(unique);
    }

    private static String blankToNull(String value) {
        if (value == null) {
            return null;
        }
        String stripped = value.strip();
        return stripped.isEmpty() ? null : stripped;
    }

    private static String buildUpdateMessage(String nickname, CharacterResponse before, CharacterResponse after) {
        if (!before.tierLabel().equals(after.tierLabel())) {
            return nickname + "님이 " + after.name() + "의 티어를 " + before.tierLabel() + " → " + after.tierLabel()
                    + "로 변경했습니다.";
        }
        if (before.mainPosition() != after.mainPosition() || !before.subPositions().equals(after.subPositions())) {
            return nickname + "님이 " + after.name() + "의 포지션을 변경했습니다.";
        }
        if (!before.name().equals(after.name())) {
            return nickname + "님이 " + before.name() + "의 이름을 " + after.name() + "(으)로 변경했습니다.";
        }
        return nickname + "님이 " + after.name() + "의 정보를 수정했습니다.";
    }
}
