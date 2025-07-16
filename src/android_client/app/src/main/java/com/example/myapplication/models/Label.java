package com.example.myapplication.models;

import com.google.gson.annotations.SerializedName;
import java.util.List;

public class Label {
    @SerializedName(value = "id", alternate = {"_id"})
    private String id;
    private String name;
    private String color;
    private String parentId;
    private List<String> mailIds;

    // Constructors
    public Label() {}

    public Label(String id, String name, String color, String parentId, List<String> mailIds) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.parentId = parentId;
        this.mailIds = mailIds;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    public String getParentId() { return parentId; }
    public void setParentId(String parentId) { this.parentId = parentId; }
    public List<String> getMailIds() { return mailIds; }
    public void setMailIds(List<String> mailIds) { this.mailIds = mailIds; }
} 