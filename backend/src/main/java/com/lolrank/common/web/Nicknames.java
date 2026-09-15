package com.lolrank.common.web;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

/**
 * 닉네임은 인증 수단이 아니라 변경 기록 표시용이다.
 * 프론트엔드는 한글 헤더 전송을 위해 encodeURIComponent 로 인코딩해서 보낸다.
 */
public final class Nicknames {

    public static final String HEADER = "X-Nickname";
    public static final String DEFAULT = "익명";
    private static final int MAX_LENGTH = 20;

    private Nicknames() {
    }

    public static String resolve(String rawHeader) {
        if (rawHeader == null || rawHeader.isBlank()) {
            return DEFAULT;
        }
        String decoded;
        try {
            decoded = URLDecoder.decode(rawHeader, StandardCharsets.UTF_8).strip();
        } catch (IllegalArgumentException e) {
            return DEFAULT;
        }
        if (decoded.isBlank()) {
            return DEFAULT;
        }
        return decoded.length() > MAX_LENGTH ? decoded.substring(0, MAX_LENGTH) : decoded;
    }
}
