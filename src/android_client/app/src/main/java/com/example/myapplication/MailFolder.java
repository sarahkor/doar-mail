package com.example.myapplication;

public enum MailFolder {
    INBOX("Inbox"),
    SENT("Sent"),
    DRAFTS("Drafts"),
    SPAM("Spam"),
    TRASH("Trash"),
    STARRED("Starred"),
    ALL_MAIL("All Mail");

    private final String displayName;

    MailFolder(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
} 