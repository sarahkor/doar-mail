package com.example.myapplication.models;

import androidx.room.TypeConverter;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class Converters {
    @TypeConverter
    public static List<String> fromString(String value) {
        if (value == null || value.isEmpty()) return Collections.emptyList();
        return Arrays.asList(value.split(","));
    }

    @TypeConverter
    public static String fromList(List<String> list) {
        if (list == null || list.isEmpty()) return "";
        return String.join(",", list);
    }
} 