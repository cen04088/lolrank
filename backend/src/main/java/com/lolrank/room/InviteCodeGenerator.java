package com.lolrank.room;

import java.security.SecureRandom;
import org.springframework.stereotype.Component;

@Component
public class InviteCodeGenerator {

    /** 헷갈리기 쉬운 0/O/1/I 는 제외한다. */
    private static final String ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    public static final int LENGTH = 6;

    private final SecureRandom random = new SecureRandom();

    public String generate() {
        StringBuilder sb = new StringBuilder(LENGTH);
        for (int i = 0; i < LENGTH; i++) {
            sb.append(ALPHABET.charAt(random.nextInt(ALPHABET.length())));
        }
        return sb.toString();
    }
}
