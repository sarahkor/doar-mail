package com.example.myapplication.models;

import java.util.List;

public class Label {
    private int id;
    private String name;
    private String color;
    private Integer parentId;
    private List<Integer> mailIds;

    // Constructors
    public Label() {}

    public Label(int id, String name, String color, Integer parentId, List<Integer> mailIds) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.parentId = parentId;
        this.mailIds = mailIds;
    }

    // Getters and Setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public Integer getParentId() {
        return parentId;
    }

    public void setParentId(Integer parentId) {
        this.parentId = parentId;
    }

    public List<Integer> getMailIds() {
        return mailIds;
    }

    public void setMailIds(List<Integer> mailIds) {
        this.mailIds = mailIds;
    }
} 