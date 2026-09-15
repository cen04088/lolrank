package com.lolrank.character;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/** 부 포지션 목록을 "MID,ADC" 처럼 콤마로 이어 한 컬럼에 저장한다. */
@Converter
public class PositionListConverter implements AttributeConverter<List<Position>, String> {

    private static final String SEPARATOR = ",";

    @Override
    public String convertToDatabaseColumn(List<Position> positions) {
        if (positions == null || positions.isEmpty()) {
            return null;
        }
        return positions.stream().map(Enum::name).collect(Collectors.joining(SEPARATOR));
    }

    @Override
    public List<Position> convertToEntityAttribute(String column) {
        if (column == null || column.isBlank()) {
            return new ArrayList<>();
        }
        return Arrays.stream(column.split(SEPARATOR))
                .map(String::strip)
                .filter(s -> !s.isEmpty())
                .map(Position::valueOf)
                .collect(Collectors.toCollection(ArrayList::new));
    }
}
