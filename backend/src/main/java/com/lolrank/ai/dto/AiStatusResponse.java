package com.lolrank.ai.dto;

/** 프론트가 AI 버튼을 보여줄지 결정하는 데 쓴다. 키 값은 절대 내려주지 않는다. */
public record AiStatusResponse(boolean commentary, String provider, String model) {
}
