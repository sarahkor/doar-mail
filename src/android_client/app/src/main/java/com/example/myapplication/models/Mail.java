package com.example.myapplication.models;

import java.util.List;

public class Mail {
    private int id;
    private String from;
    private String fromName;
    private String to;
    private String subject;
    private String bodyPreview;
    private String date;
    private String time;
    private String status;
    private boolean starred;
    private List<Attachment> attachments;

    // Constructors
    public Mail() {}

    // Getters
    public int getId() { return id; }
    public String getFrom() { return from; }
    public String getFromName() { return fromName; }
    public String getTo() { return to; }
    public String getSubject() { return subject; }
    public String getBodyPreview() { return bodyPreview; }
    public String getDate() { return date; }
    public String getTime() { return time; }
    public String getStatus() { return status; }
    public boolean isStarred() { return starred; }
    public List<Attachment> getAttachments() { return attachments; }

    // Setters
    public void setId(int id) { this.id = id; }
    public void setFrom(String from) { this.from = from; }
    public void setFromName(String fromName) { this.fromName = fromName; }
    public void setTo(String to) { this.to = to; }
    public void setSubject(String subject) { this.subject = subject; }
    public void setBodyPreview(String bodyPreview) { this.bodyPreview = bodyPreview; }
    public void setDate(String date) { this.date = date; }
    public void setTime(String time) { this.time = time; }
    public void setStatus(String status) { this.status = status; }
    public void setStarred(boolean starred) { this.starred = starred; }
    public void setAttachments(List<Attachment> attachments) { this.attachments = attachments; }

    public String getDisplaySubject() {
        return subject != null && !subject.trim().isEmpty() ? subject : "(no subject)";
    }

    public String getDisplayFrom() {
        return fromName != null && !fromName.trim().isEmpty() ? fromName : from;
    }

    public static class Attachment {
        private String originalName;
        private String mimetype;
        private int size;
        private String url;

        // Getters and setters
        public String getOriginalName() { return originalName; }
        public String getMimetype() { return mimetype; }
        public int getSize() { return size; }
        public String getUrl() { return url; }

        public void setOriginalName(String originalName) { this.originalName = originalName; }
        public void setMimetype(String mimetype) { this.mimetype = mimetype; }
        public void setSize(int size) { this.size = size; }
        public void setUrl(String url) { this.url = url; }
    }
} 