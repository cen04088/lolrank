package com.lolrank.team;

import com.lolrank.changelog.ChangeLogAction;
import com.lolrank.changelog.ChangeLogService;
import com.lolrank.character.PlayerCharacter;
import com.lolrank.character.PlayerCharacterRepository;
import com.lolrank.character.Position;
import com.lolrank.common.exception.BadRequestException;
import com.lolrank.room.Room;
import com.lolrank.room.RoomService;
import com.lolrank.team.balance.AutoFillMode;
import com.lolrank.team.balance.AutoFillSolver;
import com.lolrank.team.balance.SkillScoreCalculator;
import com.lolrank.team.balance.TeamBalance;
import com.lolrank.team.dto.BalanceResponse;
import com.lolrank.team.dto.SlotRequest;
import com.lolrank.team.dto.SlotResponse;
import com.lolrank.team.dto.TeamBoardResponse;
import com.lolrank.team.dto.UpdateTeamBoardRequest;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class TeamBoardService {

    public static final int MAX_PARTICIPANTS = 10;

    private static final Comparator<TeamSlot> SLOT_ORDER =
            Comparator.comparing(TeamSlot::getTeam).thenComparing(TeamSlot::getPosition);

    private final TeamSlotRepository slotRepository;
    private final TeamParticipantRepository participantRepository;
    private final PlayerCharacterRepository characterRepository;
    private final RoomService roomService;
    private final ChangeLogService changeLogService;
    private final AutoFillSolver autoFillSolver = new AutoFillSolver();

    public TeamBoardService(TeamSlotRepository slotRepository,
                            TeamParticipantRepository participantRepository,
                            PlayerCharacterRepository characterRepository,
                            RoomService roomService,
                            ChangeLogService changeLogService) {
        this.slotRepository = slotRepository;
        this.participantRepository = participantRepository;
        this.characterRepository = characterRepository;
        this.roomService = roomService;
        this.changeLogService = changeLogService;
    }

    /** 슬롯이 아직 없는 방이면 생성하므로 읽기 전용이 아니다. */
    @Transactional
    public TeamBoardResponse getBoard(String inviteCode) {
        Room room = roomService.getByInviteCode(inviteCode);
        return toResponse(ensureSlots(room), selectedParticipants(room));
    }

    @Transactional
    public TeamBoardResponse updateParticipants(String inviteCode, List<Long> characterIds, String nickname) {
        Room room = roomService.getByInviteCode(inviteCode);
        Set<Long> ids = new LinkedHashSet<>(characterIds);
        if (ids.size() > MAX_PARTICIPANTS) {
            throw new BadRequestException("오늘의 참가자는 최대 " + MAX_PARTICIPANTS + "명까지 선택할 수 있습니다.");
        }
        Map<Long, PlayerCharacter> charactersById = roomCharacters(room, ids);

        Map<Long, TeamParticipant> existing = participantRepository.findAllByRoomId(room.getId()).stream()
                .collect(Collectors.toMap(p -> p.getCharacter().getId(), Function.identity()));

        for (TeamParticipant participant : existing.values()) {
            participant.setSelected(ids.contains(participant.getCharacter().getId()));
        }
        List<TeamParticipant> created = new ArrayList<>();
        for (Long id : ids) {
            if (!existing.containsKey(id)) {
                created.add(new TeamParticipant(room, charactersById.get(id), true));
            }
        }
        participantRepository.saveAll(created);

        // 참가자에서 빠진 캐릭터는 보드에서도 내린다.
        List<TeamSlot> slots = ensureSlots(room);
        for (TeamSlot slot : slots) {
            if (!slot.isEmpty() && !ids.contains(slot.getCharacterId())) {
                slot.clear();
            }
        }

        changeLogService.record(room, null, nickname, ChangeLogAction.PARTICIPANTS_UPDATED,
                null, ids, nickname + "님이 오늘의 참가자를 변경했습니다. (" + ids.size() + "명)");
        return toResponse(slots, new ArrayList<>(charactersById.values()));
    }

    @Transactional
    public TeamBoardResponse updateBoard(String inviteCode, UpdateTeamBoardRequest request, String nickname) {
        Room room = roomService.getByInviteCode(inviteCode);
        List<TeamSlot> slots = ensureSlots(room);
        List<PlayerCharacter> participants = selectedParticipants(room);
        Map<Long, PlayerCharacter> participantsById = participants.stream()
                .collect(Collectors.toMap(PlayerCharacter::getId, Function.identity()));

        Map<AutoFillSolver.SlotKey, SlotRequest> requested = validateSlotRequests(request.slots(), participantsById);
        List<SlotResponse> before = slots.stream().map(SlotResponse::from).toList();

        for (TeamSlot slot : slots) {
            SlotRequest slotRequest = requested.get(new AutoFillSolver.SlotKey(slot.getTeam(), slot.getPosition()));
            if (slotRequest == null || slotRequest.characterId() == null) {
                slot.clear();
            } else {
                AssignmentSource source = Objects.requireNonNullElse(slotRequest.source(), AssignmentSource.MANUAL);
                slot.assign(participantsById.get(slotRequest.characterId()), source);
            }
        }

        List<SlotResponse> after = slots.stream().map(SlotResponse::from).toList();
        boolean reset = slots.stream().allMatch(TeamSlot::isEmpty);
        changeLogService.record(room, null, nickname,
                reset ? ChangeLogAction.TEAM_BOARD_RESET : ChangeLogAction.TEAM_BOARD_UPDATED,
                before, after,
                reset ? nickname + "님이 팀 보드를 초기화했습니다." : nickname + "님이 팀 구성을 변경했습니다.");
        return toResponse(slots, participants);
    }

    /**
     * MANUAL 슬롯은 고정하고, AUTO 슬롯은 비운 뒤 남은 참가자를 남은 슬롯에 최적 배치한다.
     */
    @Transactional
    public TeamBoardResponse autoFill(String inviteCode, AutoFillMode mode, String nickname) {
        Room room = roomService.getByInviteCode(inviteCode);
        List<TeamSlot> slots = ensureSlots(room);
        List<PlayerCharacter> participants = selectedParticipants(room);
        if (participants.isEmpty()) {
            throw new BadRequestException("오늘의 참가자를 먼저 선택해주세요.");
        }
        List<SlotResponse> before = slots.stream().map(SlotResponse::from).toList();

        slots.stream().filter(TeamSlot::isAuto).forEach(TeamSlot::clear);

        Set<Long> placedIds = new HashSet<>();
        int fixedBlue = 0;
        int fixedRed = 0;
        for (TeamSlot slot : slots) {
            if (slot.isEmpty()) {
                continue;
            }
            placedIds.add(slot.getCharacterId());
            int score = SkillScoreCalculator.score(slot.getCharacter());
            if (slot.getTeam() == Team.BLUE) {
                fixedBlue += score;
            } else {
                fixedRed += score;
            }
        }

        List<AutoFillSolver.SlotKey> emptySlots = slots.stream()
                .filter(TeamSlot::isEmpty)
                .map(s -> new AutoFillSolver.SlotKey(s.getTeam(), s.getPosition()))
                .toList();
        List<AutoFillSolver.Candidate> candidates = participants.stream()
                .filter(c -> !placedIds.contains(c.getId()))
                .map(c -> new AutoFillSolver.Candidate(c.getId(), SkillScoreCalculator.score(c),
                        c.getMainPosition(), c.getSubPosition()))
                .toList();

        AutoFillSolver.Solution solution = autoFillSolver.solve(emptySlots, candidates, fixedBlue, fixedRed, mode);

        Map<Long, PlayerCharacter> participantsById = participants.stream()
                .collect(Collectors.toMap(PlayerCharacter::getId, Function.identity()));
        Map<AutoFillSolver.SlotKey, TeamSlot> slotsByKey = slots.stream()
                .collect(Collectors.toMap(s -> new AutoFillSolver.SlotKey(s.getTeam(), s.getPosition()),
                        Function.identity()));
        for (AutoFillSolver.Assignment assignment : solution.assignments()) {
            slotsByKey.get(assignment.slot())
                    .assign(participantsById.get(assignment.characterId()), AssignmentSource.AUTO);
        }

        TeamBoardResponse response = toResponse(slots, participants);
        changeLogService.record(room, null, nickname, ChangeLogAction.TEAM_AUTO_FILLED,
                before, response.slots(),
                nickname + "님이 남은 자리를 자동으로 채웠습니다. (" + mode + ", 밸런스: " + response.balance().grade() + ")");
        return response;
    }

    /** 캐릭터 삭제 전 보드/참가자에서 제거한다. */
    @Transactional
    public void detachCharacter(PlayerCharacter character) {
        slotRepository.findAllByCharacterId(character.getId()).forEach(TeamSlot::clear);
        participantRepository.deleteAll(participantRepository.findAllByCharacterId(character.getId()));
    }

    // ---------------------------------------------------------------- helpers

    private List<TeamSlot> ensureSlots(Room room) {
        List<TeamSlot> slots = new ArrayList<>(slotRepository.findAllByRoomId(room.getId()));
        if (slots.size() < Team.values().length * Position.values().length) {
            Set<AutoFillSolver.SlotKey> existing = slots.stream()
                    .map(s -> new AutoFillSolver.SlotKey(s.getTeam(), s.getPosition()))
                    .collect(Collectors.toSet());
            List<TeamSlot> missing = new ArrayList<>();
            for (Team team : Team.values()) {
                for (Position position : Position.values()) {
                    if (!existing.contains(new AutoFillSolver.SlotKey(team, position))) {
                        missing.add(new TeamSlot(room, team, position));
                    }
                }
            }
            slots.addAll(slotRepository.saveAll(missing));
        }
        slots.sort(SLOT_ORDER);
        return slots;
    }

    private List<PlayerCharacter> selectedParticipants(Room room) {
        return participantRepository.findAllByRoomId(room.getId()).stream()
                .filter(TeamParticipant::isSelected)
                .map(TeamParticipant::getCharacter)
                .sorted(Comparator.comparing(PlayerCharacter::getId))
                .toList();
    }

    private Map<Long, PlayerCharacter> roomCharacters(Room room, Set<Long> ids) {
        if (ids.isEmpty()) {
            return new HashMap<>();
        }
        Map<Long, PlayerCharacter> found = characterRepository.findAllByRoomIdAndIdIn(room.getId(), ids).stream()
                .collect(Collectors.toMap(PlayerCharacter::getId, Function.identity()));
        if (found.size() != ids.size()) {
            throw new BadRequestException("이 방에 없는 캐릭터가 포함되어 있습니다.");
        }
        return found;
    }

    private static Map<AutoFillSolver.SlotKey, SlotRequest> validateSlotRequests(
            List<SlotRequest> requests, Map<Long, PlayerCharacter> participantsById) {
        Map<AutoFillSolver.SlotKey, SlotRequest> byKey = new HashMap<>();
        Set<Long> seenCharacters = new HashSet<>();
        for (SlotRequest request : requests) {
            AutoFillSolver.SlotKey key = new AutoFillSolver.SlotKey(request.team(), request.position());
            if (byKey.put(key, request) != null) {
                throw new BadRequestException("같은 슬롯이 중복되었습니다: " + request.team() + " " + request.position());
            }
            Long characterId = request.characterId();
            if (characterId == null) {
                continue;
            }
            if (!participantsById.containsKey(characterId)) {
                throw new BadRequestException("오늘의 참가자만 팀에 배치할 수 있습니다.");
            }
            if (!seenCharacters.add(characterId)) {
                throw new BadRequestException("한 캐릭터는 하나의 슬롯에만 배치할 수 있습니다.");
            }
        }
        return byKey;
    }

    private static TeamBoardResponse toResponse(List<TeamSlot> slots, List<PlayerCharacter> participants) {
        List<PlayerCharacter> blue = new ArrayList<>();
        List<PlayerCharacter> red = new ArrayList<>();
        for (TeamSlot slot : slots) {
            if (slot.isEmpty()) {
                continue;
            }
            (slot.getTeam() == Team.BLUE ? blue : red).add(slot.getCharacter());
        }
        return new TeamBoardResponse(
                participants.stream().map(PlayerCharacter::getId).toList(),
                slots.stream().map(SlotResponse::from).toList(),
                BalanceResponse.from(TeamBalance.of(blue, red))
        );
    }
}
