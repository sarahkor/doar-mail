package com.example.myapplication.models;

import androidx.room.Entity;
import androidx.room.PrimaryKey;
import androidx.room.Ignore;

import java.io.Serializable;
import java.util.List;

@Entity(tableName = "mail")
public class Mail implements Serializable {
    @PrimaryKey
    private int id;
    private String _id; // MongoDB ObjectId from server
    private long timestamp; // Server timestamp
    private String from;
    private String fromName;
    private String to;
    private String toName; // Missing field from server
    private String subject;
    private String bodyPreview;
    private String date;
    private String time;
    private String status;
    private boolean starred;
    private boolean read; // Missing field from server  
    private String folder; // Missing field from server
    private List<String> labelIds;
    @Ignore
    private List<Attachment> attachments;

    // Constructors
    public Mail() {}

    // Getters
    public int getId() { return id; }
    public String get_id() { return _id; }
    public long getTimestamp() { return timestamp; }
    public String getFrom() { return from; }
    public String getFromName() { return fromName; }
    public String getTo() { return to; }
    public String getToName() { return toName; }
    public String getSubject() { return subject; }
    public String getBodyPreview() { return bodyPreview; }
    public String getDate() { return date; }
    public String getTime() { return time; }
    public String getStatus() { return status; }
    public boolean isStarred() { return starred; }
    public boolean isRead() { return read; }
    public String getFolder() { return folder; }
    public List<String> getLabelIds() { return labelIds; }
    public List<Attachment> getAttachments() { return attachments; }

    // Setters
    public void setId(int id) { this.id = id; }
    public void set_id(String _id) { this._id = _id; }
    public void setTimestamp(long timestamp) { this.timestamp = timestamp; }
    public void setFrom(String from) { this.from = from; }
    public void setFromName(String fromName) { this.fromName = fromName; }
    public void setTo(String to) { this.to = to; }
    public void setToName(String toName) { this.toName = toName; }
    public void setSubject(String subject) { this.subject = subject; }
    public void setBodyPreview(String bodyPreview) { this.bodyPreview = bodyPreview; }
    public void setDate(String date) { this.date = date; }
    public void setTime(String time) { this.time = time; }
    public void setStatus(String status) { this.status = status; }
    public void setStarred(boolean starred) { this.starred = starred; }
    public void setRead(boolean read) { this.read = read; }
    public void setFolder(String folder) { this.folder = folder; }
    public void setLabelIds(List<String> labelIds) { this.labelIds = labelIds; }
    public void setAttachments(List<Attachment> attachments) { this.attachments = attachments; }

    public String getDisplaySubject() {
        return subject != null && !subject.trim().isEmpty() ? subject : "(no subject)";
    }

    public String getDisplayFrom() {
        return fromName != null && !fromName.trim().isEmpty() ? fromName : from;
    }
    
    public String getDisplayTo() {
        return toName != null && !toName.trim().isEmpty() ? toName : to;
    }
    
    public String getDisplayTitleWithRecipient() {
        String recipient = getDisplayTo();
        String subject = getDisplaySubject();
        return "To: " + (recipient != null ? recipient : "Unknown") + " - " + subject;
    }
    
    // Utility method to convert MongoDB ObjectId to integer for local use
    public void convertIdFromString() {
        if (_id != null && !_id.isEmpty()) {
            // Use hashCode of the ObjectId string as integer ID for local storage
            this.id = Math.abs(_id.hashCode());
        }
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