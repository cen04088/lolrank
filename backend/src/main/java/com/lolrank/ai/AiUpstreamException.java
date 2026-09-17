package com.lolrank.ai;

import com.lolrank.common.exception.ApiException;
import org.springframework.http.HttpStatus;

/** LLM 제공자 호출이 실패했을 때 (타임아웃, 4xx/5xx, 파싱 실패). 클라이언트에는 502 로 전달한다. */
public class AiUpstreamException extends ApiException {

    public AiUpstreamException(String message) {
        super(HttpStatus.BAD_GATEWAY, "AI_UPSTREAM", message);
    }
}
