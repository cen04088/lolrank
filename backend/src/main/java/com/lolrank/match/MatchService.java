package com.lolrank.match;

import com.lolrank.changelog.ChangeLogAction;
import com.lolrank.changelog.ChangeLogService;
import com.lolrank.character.PlayerCharacter;
import com.lolrank.common.exception.BadRequestException;
import com.lolrank.common.exception.NotFoundException;
import com.lolrank.match.dto.MatchResponse;
import com.lolrank.match.dto.RecordMatchRequest;
import com.lolrank.match.dto.UpdateMatchRequest;
import com.lolrank.room.Room;
import com.lolrank.room.RoomService;
import com.lolrank.team.Team;
import com.lolrank.team.TeamSlot;
import com.lolrank.team.TeamSlotRepository;
import com.lolrank.team.StrengthService;
import com.lolrank.team.balance.TeamBalance;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 경기(조합) 기록. 보드가 다 찼을 때 스냅샷을 남기고, 승패는 나중에 채운다. */
@Service
@Transactional
public class MatchService {

    private static final int FULL_BOARD = 10;
    private static final int MAX_LIST = 200;

    private final RoomService roomService;
    private final TeamSlotRepository slotRepository;
    private final MatchRecordRepository matchRepository;
    private final ChangeLogService changeLogService;
    private final RatingService ratingService;
    private final StrengthService strengthService;

    public MatchService(RoomService roomService, TeamSlotRepository slotRepository,
                        MatchRecordRepository matchRepository, ChangeLogService changeLogService,
                        RatingService ratingService, StrengthService strengthService) {
        this.roomService = roomService;
        this.slotRepository = slotRepository;
        this.matchRepository = matchRepository;
        this.changeLogService = changeLogService;
        this.ratingService = ratingService;
        this.strengthService = strengthService;
    }

    public MatchResponse record(String inviteCode, RecordMatchRequest request, String nickname) {
        Room room = roomService.getByInviteCode(inviteCode);
        List<TeamSlot> slots = slotRepository.findAllByRoomId(room.getId()).stream()
                .filter(s -> s.getCharacter() != null)
                .toList();
        if (slots.size() < FULL_BOARD) {
            throw new BadRequestException("10자리가 모두 채워진 조합만 기록할 수 있습니다. (현재 " + slots.size() + "/10)");
        }

        List<PlayerCharacter> blue = slots.stream().filter(s -> s.getTeam() == Team.BLUE).map(TeamSlot::getCharacter).toList();
        List<PlayerCharacter> red = slots.stream().filter(s -> s.getTeam() == Team.RED).map(TeamSlot::getCharacter).toList();
        // 화면과 같은 실효 전투력으로 당시 밸런스를 남긴다. 슬롯 스냅샷에는 재생용 기본 전투력을 넣는다.
        TeamBalance balance = TeamBalance.of(blue, red, ratingService.strengthFunction(room.getId()));
        java.util.function.ToIntFunction<PlayerCharacter> baseStrength = strengthService.baseStrengthFunction(room.getId());

        MatchRecord record = new MatchRecord(room, request.winner(), blankToNull(request.note()), nickname,
                balance.blueScore(), balance.redScore(), balance.difference(), balance.grade());
        for (TeamSlot slot : slots) {
            record.addSlot(new MatchRecordSlot(record, slot.getTeam(), slot.getPosition(), slot.getCharacter(),
                    baseStrength.applyAsInt(slot.getCharacter())));
        }
        MatchRecord saved = matchRepository.save(record);

        MatchResponse response = MatchResponse.from(saved);
        changeLogService.record(room, null, nickname, ChangeLogAction.MATCH_RECORDED, null, response,
                nickname + "님이 조합을 기록했습니다." + winnerSuffix(saved.getWinner()));
        return response;
    }

    @Transactional(readOnly = true)
    public List<MatchResponse> list(String inviteCode, int limit) {
        Room room = roomService.getByInviteCode(inviteCode);
        int size = Math.max(1, Math.min(limit, MAX_LIST));
        return matchRepository.findAllByRoomIdOrderByPlayedAtDescIdDesc(room.getId(), PageRequest.of(0, size)).stream()
                .map(MatchResponse::from)
                .toList();
    }

    public MatchResponse update(Long matchId, UpdateMatchRequest request, String nickname) {
        MatchRecord record = get(matchId);
        MatchResponse before = MatchResponse.from(record);
        String note = request.note() != null ? blankToNull(request.note()) : record.getNote();
        record.changeResult(request.winner(), note);
        MatchResponse after = MatchResponse.from(record);
        changeLogService.record(record.getRoom(), null, nickname, ChangeLogAction.MATCH_UPDATED, before, after,
                nickname + "님이 경기 결과를 수정했습니다." + winnerSuffix(record.getWinner()));
        return after;
    }

    public void delete(Long matchId, String nickname) {
        MatchRecord record = get(matchId);
        MatchResponse before = MatchResponse.from(record);
        Room room = record.getRoom();
        matchRepository.delete(record);
        changeLogService.record(room, null, nickname, ChangeLogAction.MATCH_DELETED, before, null,
                nickname + "님이 경기 기록을 삭제했습니다.");
    }

    /** 방 삭제 시 하위 기록 정리 */
    public void deleteAllByRoomId(Long roomId) {
        matchRepository.deleteAllSlotsByRoomId(roomId);
        matchRepository.deleteAllByRoomId(roomId);
    }

    private MatchRecord get(Long matchId) {
        return matchRepository.findById(matchId)
                .orElseThrow(() -> new NotFoundException("경기 기록을 찾을 수 없습니다."));
    }

    private static String winnerSuffix(Team winner) {
        return winner == null ? " (결과 미정)" : " (" + winner.name() + " 승)";
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.strip();
    }
}
