package com.lolrank.ai;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

/**
 * DeepSeek Chat Completions (OpenAI 호환) 호출.
 * 키는 환경 변수 DEEPSEEK_API_KEY 로만 들어오고, 비어 있으면 기능 전체가 꺼진다.
 */
@Component
public class DeepSeekCommentaryGenerator implements CommentaryGenerator {

    private static final Logger log = LoggerFactory.getLogger(DeepSeekCommentaryGenerator.class);

    private final String apiKey;
    private final String baseUrl;
    private final String model;
    private final Duration timeout;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public DeepSeekCommentaryGenerator(@Value("${app.ai.deepseek.api-key:}") String apiKey,
                                       @Value("${app.ai.deepseek.base-url:https://api.deepseek.com}") String baseUrl,
                                       @Value("${app.ai.deepseek.model:deepseek-chat}") String model,
                                       @Value("${app.ai.deepseek.timeout-seconds:25}") long timeoutSeconds,
                                       ObjectMapper objectMapper) {
        this.apiKey = apiKey == null ? "" : apiKey.strip();
        this.baseUrl = baseUrl.replaceAll("/+$", "");
        this.model = model;
        this.timeout = Duration.ofSeconds(timeoutSeconds);
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    @Override
    public boolean isEnabled() {
        return !apiKey.isEmpty();
    }

    @Override
    public String modelName() {
        return model;
    }

    @Override
    public String generate(String systemPrompt, String userPrompt) {
        if (!isEnabled()) {
            throw new AiUpstreamException("AI 해설이 설정되지 않았습니다.");
        }
        Map<String, Object> body = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", userPrompt)
                ),
                "temperature", 0.9,
                "max_tokens", 700,
                "stream", false
        );
        HttpRequest request = HttpRequest.newBuilder(URI.create(baseUrl + "/chat/completions"))
                .timeout(timeout)
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + apiKey)
                .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body), StandardCharsets.UTF_8))
                .build();

        HttpResponse<String> response;
        try {
            response = httpClient.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
        } catch (IOException e) {
            log.warn("DeepSeek 호출 실패: {}", e.toString());
            throw new AiUpstreamException("AI 서버에 연결하지 못했습니다. 잠시 후 다시 시도해주세요.");
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new AiUpstreamException("AI 호출이 중단되었습니다.");
        }

        if (response.statusCode() / 100 != 2) {
            log.warn("DeepSeek 응답 오류 {}: {}", response.statusCode(), abbreviate(response.body()));
            throw new AiUpstreamException("AI 서버가 응답을 거부했습니다. (" + response.statusCode() + ")");
        }
        return extractContent(response.body());
    }

    private String extractContent(String json) {
        try {
            JsonNode root = objectMapper.readTree(json);
            JsonNode content = root.path("choices").path(0).path("message").path("content");
            if (content.isMissingNode() || content.isNull()) {
                throw new AiUpstreamException("AI 응답 형식을 해석하지 못했습니다.");
            }
            String text = content.asString().strip();
            if (text.isEmpty()) {
                throw new AiUpstreamException("AI 가 빈 해설을 돌려주었습니다.");
            }
            return text;
        } catch (AiUpstreamException e) {
            throw e;
        } catch (RuntimeException e) {
            log.warn("DeepSeek 응답 파싱 실패: {}", abbreviate(json));
            throw new AiUpstreamException("AI 응답 형식을 해석하지 못했습니다.");
        }
    }

    private static String abbreviate(String s) {
        if (s == null) return "";
        return s.length() > 300 ? s.substring(0, 300) + "…" : s;
    }
}
