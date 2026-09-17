package com.lolrank.ai.dto;

import java.time.Instant;

/**
 * @param text        해설 본문
 * @param boardHash   해설이 만들어진 보드의 지문. 프론트는 보드가 바뀌면 이 값이 달라지는 것으로 해설을 접는다
 * @param cached      캐시에서 돌려준 결과인지
 * @param model       사용 모델
 * @param generatedAt 최초 생성 시각
 */
public record CommentaryResponse(String text, String boardHash, boolean cached, String model, Instant generatedAt) {

    public CommentaryResponse asCached() {
        return new CommentaryResponse(text, boardHash, true, model, generatedAt);
    }
}
