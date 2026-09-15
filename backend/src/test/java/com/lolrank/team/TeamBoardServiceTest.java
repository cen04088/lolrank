package com.lolrank.team;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.lolrank.character.CharacterService;
import com.lolrank.character.Position;
import com.lolrank.character.Tier;
import com.lolrank.character.dto.CharacterResponse;
import com.lolrank.character.dto.CreateCharacterRequest;
import com.lolrank.common.exception.BadRequestException;
import com.lolrank.room.Room;
import com.lolrank.room.RoomService;
import com.lolrank.team.balance.AutoFillMode;
import com.lolrank.team.dto.SlotRequest;
import com.lolrank.team.dto.SlotResponse;
import com.lolrank.team.dto.TeamBoardResponse;
import com.lolrank.team.dto.UpdateTeamBoardRequest;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class TeamBoardServiceTest {

    private static final String NICK = "테스터";

    @Autowired
    private RoomService roomService;
    @Autowired
    private CharacterService characterService;
    @Autowired
    private TeamBoardService teamBoardService;

    private String code;
    private List<CharacterResponse> characters;

    @BeforeEach
    void setUp() {
        Room room = roomService.create("테스트 방");
        code = room.getInviteCode();
        characters = new ArrayList<>();
        Position[] positions = Position.values();
        Tier[] tiers = {Tier.GOLD, Tier.SILVER, Tier.PLATINUM, Tier.BRONZE, Tier.EMERALD,
                Tier.GOLD, Tier.SILVER, Tier.PLATINUM, Tier.BRONZE, Tier.EMERALD};
        for (int i = 0; i < 10; i++) {
            Position main = positions[i % positions.length];
            Position sub = positions[(i + 1) % positions.length];
            characters.add(characterService.create(code, new CreateCharacterRequest(
                    "선수" + (i + 1), null, null, "player_0" + (i % 8 + 1), tiers[i], 4, main, List.of(sub)), NICK));
        }
        teamBoardService.updateParticipants(code, characters.stream().map(CharacterResponse::id).toList(), NICK);
    }

    @Test
    void 보드는_항상_10개_슬롯을_가진다() {
        TeamBoardResponse board = teamBoardService.getBoard(code);
        assertThat(board.slots()).hasSize(10);
        assertThat(board.participantIds()).hasSize(10);
        assertThat(board.slots()).allMatch(s -> s.characterId() == null);
    }

    @Test
    void 참가자는_10명을_넘을_수_없다() {
        CharacterResponse extra = characterService.create(code, new CreateCharacterRequest(
                "열한번째", null, null, "player_01", Tier.GOLD, 1, Position.TOP, List.of()), NICK);
        List<Long> ids = new ArrayList<>(characters.stream().map(CharacterResponse::id).toList());
        ids.add(extra.id());

        assertThatThrownBy(() -> teamBoardService.updateParticipants(code, ids, NICK))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    void 참가자가_아닌_캐릭터는_슬롯에_배치할_수_없다() {
        CharacterResponse outsider = characterService.create(code, new CreateCharacterRequest(
                "외부인", null, null, "player_01", Tier.GOLD, 1, Position.TOP, List.of()), NICK);

        UpdateTeamBoardRequest request = new UpdateTeamBoardRequest(List.of(
                new SlotRequest(Team.BLUE, Position.TOP, outsider.id(), AssignmentSource.MANUAL)));

        assertThatThrownBy(() -> teamBoardService.updateBoard(code, request, NICK))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    void 수동_배치와_스왑이_저장된다() {
        Long a = characters.get(0).id();
        Long b = characters.get(1).id();
        teamBoardService.updateBoard(code, new UpdateTeamBoardRequest(List.of(
                new SlotRequest(Team.BLUE, Position.TOP, a, null),
                new SlotRequest(Team.RED, Position.MID, b, AssignmentSource.MANUAL))), NICK);

        TeamBoardResponse board = teamBoardService.getBoard(code);
        assertThat(slot(board, Team.BLUE, Position.TOP).characterId()).isEqualTo(a);
        assertThat(slot(board, Team.BLUE, Position.TOP).source()).isEqualTo(AssignmentSource.MANUAL);
        assertThat(slot(board, Team.RED, Position.MID).characterId()).isEqualTo(b);

        // SWAP
        teamBoardService.updateBoard(code, new UpdateTeamBoardRequest(List.of(
                new SlotRequest(Team.BLUE, Position.TOP, b, AssignmentSource.MANUAL),
                new SlotRequest(Team.RED, Position.MID, a, AssignmentSource.MANUAL))), NICK);

        board = teamBoardService.getBoard(code);
        assertThat(slot(board, Team.BLUE, Position.TOP).characterId()).isEqualTo(b);
        assertThat(slot(board, Team.RED, Position.MID).characterId()).isEqualTo(a);
    }

    @Test
    void 자동배정은_MANUAL_슬롯을_절대_움직이지_않고_나머지를_채운다() {
        Long manualBlueTop = characters.get(3).id();
        Long manualRedAdc = characters.get(7).id();
        teamBoardService.updateBoard(code, new UpdateTeamBoardRequest(List.of(
                new SlotRequest(Team.BLUE, Position.TOP, manualBlueTop, AssignmentSource.MANUAL),
                new SlotRequest(Team.RED, Position.ADC, manualRedAdc, AssignmentSource.MANUAL))), NICK);

        TeamBoardResponse board = teamBoardService.autoFill(code, AutoFillMode.SKILL_BALANCE, NICK);

        assertThat(slot(board, Team.BLUE, Position.TOP).characterId()).isEqualTo(manualBlueTop);
        assertThat(slot(board, Team.BLUE, Position.TOP).source()).isEqualTo(AssignmentSource.MANUAL);
        assertThat(slot(board, Team.RED, Position.ADC).characterId()).isEqualTo(manualRedAdc);
        assertThat(slot(board, Team.RED, Position.ADC).source()).isEqualTo(AssignmentSource.MANUAL);

        assertThat(board.slots()).allMatch(s -> s.characterId() != null);
        assertThat(board.slots().stream().filter(s -> s.source() == AssignmentSource.AUTO).count()).isEqualTo(8);
        Set<Long> placed = new HashSet<>(board.slots().stream().map(SlotResponse::characterId).toList());
        assertThat(placed).hasSize(10);
        assertThat(board.balance().grade()).isNotNull();
        assertThat(board.balance().blueCount()).isEqualTo(5);
        assertThat(board.balance().redCount()).isEqualTo(5);
    }

    @Test
    void 자동배정을_다시_실행하면_AUTO_슬롯만_재계산된다() {
        Long manualId = characters.get(0).id();
        teamBoardService.updateBoard(code, new UpdateTeamBoardRequest(List.of(
                new SlotRequest(Team.BLUE, Position.TOP, manualId, AssignmentSource.MANUAL))), NICK);
        TeamBoardResponse first = teamBoardService.autoFill(code, AutoFillMode.SKILL_BALANCE, NICK);

        // 사용자가 AUTO 캐릭터 하나를 다른 자리로 직접 옮기면 그 캐릭터는 MANUAL 이 된다.
        SlotResponse movedFrom = first.slots().stream()
                .filter(s -> s.source() == AssignmentSource.AUTO && s.team() == Team.RED)
                .findFirst().orElseThrow();
        Long movedId = movedFrom.characterId();
        List<SlotRequest> nextSlots = new ArrayList<>();
        nextSlots.add(new SlotRequest(Team.BLUE, Position.TOP, manualId, AssignmentSource.MANUAL));
        nextSlots.add(new SlotRequest(Team.BLUE, Position.SUPPORT, movedId, AssignmentSource.MANUAL));
        for (SlotResponse s : first.slots()) {
            boolean occupiedByManual = (s.team() == Team.BLUE && s.position() == Position.TOP)
                    || (s.team() == Team.BLUE && s.position() == Position.SUPPORT);
            if (!occupiedByManual && s.characterId() != null && !s.characterId().equals(movedId)) {
                nextSlots.add(new SlotRequest(s.team(), s.position(), s.characterId(), s.source()));
            }
        }
        teamBoardService.updateBoard(code, new UpdateTeamBoardRequest(nextSlots), NICK);

        TeamBoardResponse second = teamBoardService.autoFill(code, AutoFillMode.SKILL_BALANCE, NICK);

        assertThat(slot(second, Team.BLUE, Position.TOP).characterId()).isEqualTo(manualId);
        assertThat(slot(second, Team.BLUE, Position.SUPPORT).characterId()).isEqualTo(movedId);
        assertThat(slot(second, Team.BLUE, Position.SUPPORT).source()).isEqualTo(AssignmentSource.MANUAL);
        assertThat(second.slots()).allMatch(s -> s.characterId() != null);
        assertThat(second.slots().stream().filter(s -> s.source() == AssignmentSource.MANUAL).count()).isEqualTo(2);
        assertThat(second.slots().stream().filter(s -> s.source() == AssignmentSource.AUTO).count()).isEqualTo(8);
        Set<Long> placed = new HashSet<>(second.slots().stream().map(SlotResponse::characterId).toList());
        assertThat(placed).hasSize(10);
    }

    @Test
    void 참가자에서_빠진_캐릭터는_보드에서도_내려간다() {
        Long a = characters.get(0).id();
        teamBoardService.updateBoard(code, new UpdateTeamBoardRequest(List.of(
                new SlotRequest(Team.BLUE, Position.TOP, a, AssignmentSource.MANUAL))), NICK);

        List<Long> without = characters.stream().map(CharacterResponse::id).filter(id -> !id.equals(a)).toList();
        TeamBoardResponse board = teamBoardService.updateParticipants(code, without, NICK);

        assertThat(board.participantIds()).hasSize(9).doesNotContain(a);
        assertThat(slot(board, Team.BLUE, Position.TOP).characterId()).isNull();
    }

    @Test
    void 캐릭터를_삭제하면_보드와_참가자에서_제거된다() {
        Long a = characters.get(0).id();
        teamBoardService.updateBoard(code, new UpdateTeamBoardRequest(List.of(
                new SlotRequest(Team.RED, Position.JUNGLE, a, AssignmentSource.MANUAL))), NICK);

        characterService.delete(a, NICK);

        TeamBoardResponse board = teamBoardService.getBoard(code);
        assertThat(board.participantIds()).hasSize(9).doesNotContain(a);
        assertThat(slot(board, Team.RED, Position.JUNGLE).characterId()).isNull();
        assertThat(characterService.list(code)).hasSize(9);
    }

    private static SlotResponse slot(TeamBoardResponse board, Team team, Position position) {
        return board.slots().stream()
                .filter(s -> s.team() == team && s.position() == position)
                .findFirst()
                .orElseThrow();
    }
}
