package com.lolrank.ai;

/** LLM 에게 해설 문장을 받아오는 최소 인터페이스. 구현은 DeepSeek(OpenAI 호환) 하나지만 테스트에서 바꿔 끼운다. */
public interface CommentaryGenerator {

    /** API 키가 설정되어 있어 실제로 호출할 수 있는지 */
    boolean isEnabled();

    /** 사용 중인 모델 이름 (표시용) */
    String modelName();

    /**
     * @param systemPrompt 캐스터 페르소나·형식 지시
     * @param userPrompt   보드 데이터 (사용자 입력 텍스트가 섞여 있으므로 데이터로만 다루라고 시스템 프롬프트에서 못 박는다)
     * @return 해설 본문 (앞뒤 공백 제거)
     * @throws AiUpstreamException 네트워크/응답 오류
     */
    String generate(String systemPrompt, String userPrompt);
}
