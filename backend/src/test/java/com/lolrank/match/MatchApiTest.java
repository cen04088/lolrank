package com.lolrank.match;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.lolrank.character.CharacterService;
import com.lolrank.character.Position;
import com.lolrank.character.Tier;
import com.lolrank.character.dto.CharacterResponse;
import com.lolrank.character.dto.CreateCharacterRequest;
import com.lolrank.common.web.Nicknames;
import com.lolrank.room.Room;
import com.lolrank.room.RoomService;
import com.lolrank.team.TeamBoardService;
import com.lolrank.team.balance.AutoFillMode;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;
import tools.jackson.databind.ObjectMapper;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class MatchApiTest {

    private static final String NICK = "기록자";

    @Autowired
    private WebApplicationContext context;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private RoomService roomService;
    @Autowired
    private CharacterService characterService;
    @Autowired
    private TeamBoardService teamBoardService;

    private MockMvc mockMvc;
    private String code;
    private String nick;
    private List<CharacterResponse> created;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context).build();
        nick = URLEncoder.encode(NICK, StandardCharsets.UTF_8);
        Room room = roomService.create("기록 테스트 방");
        code = room.getInviteCode();
        created = new ArrayList<>();
        Position[] positions = Position.values();
        for (int i = 0; i < 10; i++) {
            created.add(characterService.create(code, new CreateCharacterRequest(
                    "선수" + (i + 1), null, i == 0 ? "철벽" : null, null, "player_01",
                    Tier.GOLD, 4, positions[i % positions.length], List.of()), NICK));
        }
    }

    private void fillBoard() {
        teamBoardService.updateParticipants(code, created.stream().map(CharacterResponse::id).toList(), NICK);
        teamBoardService.autoFill(code, AutoFillMode.SKILL_BALANCE, NICK);
    }

    @Test
    void 보드가_비어_있으면_기록할_수_없다() throws Exception {
        mockMvc.perform(post("/api/rooms/" + code + "/matches").header(Nicknames.HEADER, nick))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("10자리")));
    }

    @Test
    void 기록_조회_결과수정_삭제() throws Exception {
        fillBoard();

        String body = mockMvc.perform(post("/api/rooms/" + code + "/matches")
                        .header(Nicknames.HEADER, nick)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"winner\":null,\"note\":\"첫 내전\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.winner", nullValue()))
                .andExpect(jsonPath("$.note", is("첫 내전")))
                .andExpect(jsonPath("$.recordedBy", is(NICK)))
                .andExpect(jsonPath("$.slots", hasSize(10)))
                .andExpect(jsonPath("$.grade", is("PERFECT")))
                .andReturn().getResponse().getContentAsString();
        long id = objectMapper.readTree(body).get("id").asLong();

        // 스냅샷은 캐릭터가 바뀌어도 그대로다
        characterService.delete(created.get(0).id(), NICK);
        mockMvc.perform(get("/api/rooms/" + code + "/matches"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].slots", hasSize(10)))
                .andExpect(jsonPath("$[0].slots[?(@.characterName == '선수1')].title", hasItem("철벽")));

        mockMvc.perform(patch("/api/matches/" + id)
                        .header(Nicknames.HEADER, nick)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"winner\":\"RED\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.winner", is("RED")))
                .andExpect(jsonPath("$.note", is("첫 내전")));

        mockMvc.perform(delete("/api/matches/" + id).header(Nicknames.HEADER, nick))
                .andExpect(status().isNoContent());
        mockMvc.perform(get("/api/rooms/" + code + "/matches"))
                .andExpect(jsonPath("$", hasSize(0)));

        mockMvc.perform(get("/api/rooms/" + code + "/change-logs?limit=5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].action", is("MATCH_DELETED")));
    }

    @Test
    void 레이팅이_꺼져_있으면_승패를_기록해도_보정치는_0이고_보드_전투력이_바뀌지_않는다() throws Exception {
        fillBoard();
        String before = mockMvc.perform(get("/api/rooms/" + code + "/team-board"))
                .andReturn().getResponse().getContentAsString();
        int blueBefore = objectMapper.readTree(before).get("balance").get("blueScore").asInt();

        mockMvc.perform(get("/api/rooms/" + code + "/ratings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(10)))
                .andExpect(jsonPath("$[0].played", is(0)))
                .andExpect(jsonPath("$[0].delta", is(0)));

        mockMvc.perform(post("/api/rooms/" + code + "/matches")
                        .header(Nicknames.HEADER, nick)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"winner\":\"BLUE\"}"))
                .andExpect(status().isCreated());

        String ratings = mockMvc.perform(get("/api/rooms/" + code + "/ratings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].delta", is(0)))
                .andExpect(jsonPath("$[0].played", is(0)))
                .andExpect(jsonPath("$[9].delta", is(0)))
                .andReturn().getResponse().getContentAsString();
        org.assertj.core.api.Assertions.assertThat(ratings).contains("\"strength\"");

        String after = mockMvc.perform(get("/api/rooms/" + code + "/team-board"))
                .andReturn().getResponse().getContentAsString();
        int blueAfter = objectMapper.readTree(after).get("balance").get("blueScore").asInt();
        org.assertj.core.api.Assertions.assertThat(blueAfter).isEqualTo(blueBefore);
    }

    @Test
    void 없는_기록은_404() throws Exception {
        mockMvc.perform(patch("/api/matches/99999")
                        .header(Nicknames.HEADER, nick)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"winner\":\"BLUE\"}"))
                .andExpect(status().isNotFound());
    }
}
