package com.lolrank.character;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.lolrank.common.web.Nicknames;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
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
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class CharacterApiTest {

    @Autowired
    private WebApplicationContext context;
    @Autowired
    private ObjectMapper objectMapper;

    private MockMvc mockMvc;
    private String code;
    private final String nicknameHeader = URLEncoder.encode("민준", StandardCharsets.UTF_8);

    @BeforeEach
    void setUp() throws Exception {
        mockMvc = MockMvcBuilders.webAppContextSetup(context).build();
        String body = mockMvc.perform(post("/api/rooms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"금요 내전\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.inviteCode").isString())
                .andReturn().getResponse().getContentAsString();
        code = objectMapper.readTree(body).get("inviteCode").asString();
    }

    @Test
    void 기본_방은_항상_존재하고_같은_방을_돌려준다() throws Exception {
        String first = mockMvc.perform(get("/api/rooms/default"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.inviteCode", is("LOLRNK")))
                .andReturn().getResponse().getContentAsString();
        String second = mockMvc.perform(get("/api/rooms/default"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        org.assertj.core.api.Assertions.assertThat(objectMapper.readTree(first).get("id"))
                .isEqualTo(objectMapper.readTree(second).get("id"));
    }

    @Test
    void 방_목록에_캐릭터_수가_포함된다() throws Exception {
        createCharacter("민준");
        String body = mockMvc.perform(get("/api/rooms"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        JsonNode list = objectMapper.readTree(body);
        boolean found = false;
        for (JsonNode node : list) {
            if (code.equals(node.get("inviteCode").asString())) {
                found = true;
                org.assertj.core.api.Assertions.assertThat(node.get("characterCount").asLong()).isEqualTo(1);
            }
        }
        org.assertj.core.api.Assertions.assertThat(found).isTrue();
    }

    @Test
    void 방을_삭제하면_조회되지_않고_기본_방은_삭제할_수_없다() throws Exception {
        createCharacter("민준");
        mockMvc.perform(delete("/api/rooms/" + code)).andExpect(status().isNoContent());
        mockMvc.perform(get("/api/rooms/" + code)).andExpect(status().isNotFound());

        mockMvc.perform(delete("/api/rooms/LOLRNK"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code", is("BAD_REQUEST")));
    }

    @Test
    void 방을_초대코드로_조회한다() throws Exception {
        mockMvc.perform(get("/api/rooms/" + code))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("금요 내전")));

        mockMvc.perform(get("/api/rooms/ZZZZZZ"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code", is("NOT_FOUND")));
    }

    @Test
    void 캐릭터_생성_조회_수정_삭제() throws Exception {
        String created = mockMvc.perform(post("/api/rooms/" + code + "/characters")
                        .header(Nicknames.HEADER, nicknameHeader)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"태현","description":"라인전은 강하지만 한타에서 사라짐","title":"철벽 탑솔","champions":"가렌, 오른",
                                 "assetKey":"player_03","tier":"GOLD","division":4,
                                 "mainPosition":"TOP","subPositions":["MID","ADC"]}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.tierLabel", is("Gold IV")))
                .andExpect(jsonPath("$.subPositions", hasSize(2)))
                .andExpect(jsonPath("$.subPositions[1]", is("ADC")))
                .andExpect(jsonPath("$.hierarchyRank", is("C")))
                .andExpect(jsonPath("$.title", is("철벽 탑솔")))
                .andExpect(jsonPath("$.champions", is("가렌, 오른")))
                .andReturn().getResponse().getContentAsString();
        long id = objectMapper.readTree(created).get("id").asLong();

        mockMvc.perform(get("/api/rooms/" + code + "/characters"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name", is("태현")));

        mockMvc.perform(patch("/api/characters/" + id)
                        .header(Nicknames.HEADER, nicknameHeader)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"tier\":\"MASTER\",\"title\":\"\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").doesNotExist())
                .andExpect(jsonPath("$.tier", is("MASTER")))
                .andExpect(jsonPath("$.division", nullValue()))
                .andExpect(jsonPath("$.tierLabel", is("Master")));

        mockMvc.perform(get("/api/rooms/" + code + "/change-logs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].nickname", is("민준")))
                .andExpect(jsonPath("$[0].action", is("CHARACTER_UPDATED")));

        mockMvc.perform(delete("/api/characters/" + id).header(Nicknames.HEADER, nicknameHeader))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/rooms/" + code + "/characters"))
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void division_규칙을_검증한다() throws Exception {
        mockMvc.perform(post("/api/rooms/" + code + "/characters")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"a\",\"assetKey\":\"player_01\",\"tier\":\"GOLD\",\"mainPosition\":\"TOP\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code", is("BAD_REQUEST")));

        mockMvc.perform(post("/api/rooms/" + code + "/characters")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"a\",\"assetKey\":\"player_01\",\"tier\":\"GOLD\",\"division\":7,\"mainPosition\":\"TOP\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code", is("VALIDATION_ERROR")));

        mockMvc.perform(post("/api/rooms/" + code + "/characters")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"a\",\"assetKey\":\"player_01\",\"tier\":\"GOLD\",\"division\":1,"
                                + "\"mainPosition\":\"TOP\",\"subPositions\":[\"MID\",\"TOP\"]}"))
                .andExpect(status().isBadRequest());

        mockMvc.perform(post("/api/rooms/" + code + "/characters")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"\",\"assetKey\":\"player_01\",\"tier\":\"GOLD\",\"division\":1,\"mainPosition\":\"TOP\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code", is("VALIDATION_ERROR")));
    }

    @Test
    void 계급도_변경이_저장된다() throws Exception {
        long first = createCharacter("민준");
        long second = createCharacter("지성");

        mockMvc.perform(put("/api/rooms/" + code + "/hierarchy")
                        .header(Nicknames.HEADER, nicknameHeader)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"entries\":[{\"characterId\":" + first + ",\"rank\":\"LEGEND\",\"order\":0},"
                                + "{\"characterId\":" + second + ",\"rank\":\"S\",\"order\":0}]}"))
                .andExpect(status().isOk());

        String body = mockMvc.perform(get("/api/rooms/" + code + "/characters"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        JsonNode list = objectMapper.readTree(body);
        for (JsonNode node : list) {
            if (node.get("id").asLong() == first) {
                org.assertj.core.api.Assertions.assertThat(node.get("hierarchyRank").asString()).isEqualTo("LEGEND");
            }
            if (node.get("id").asLong() == second) {
                org.assertj.core.api.Assertions.assertThat(node.get("hierarchyRank").asString()).isEqualTo("S");
            }
        }
    }

    private long createCharacter(String name) throws Exception {
        String body = mockMvc.perform(post("/api/rooms/" + code + "/characters")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"" + name + "\",\"assetKey\":\"player_01\",\"tier\":\"SILVER\",\"division\":2,"
                                + "\"mainPosition\":\"MID\"}"))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(body).get("id").asLong();
    }
}
