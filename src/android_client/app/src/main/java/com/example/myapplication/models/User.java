package com.example.myapplication.models;

public class User {
    private String id;
    private String firstName;
    private String lastName;
    private String username;
    private String picture;
    private String phone;
    private String birthday;
    private String gender;

    // Constructors
    public User() {}

    public User(String id, String firstName, String lastName, String username) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.username = username;
    }

    // Getters
    public String getId() { return id; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getUsername() { return username; }
    public String getPicture() { return picture; }
    public String getPhone() { return phone; }
    public String getBirthday() { return birthday; }
    public String getGender() { return gender; }

    // Setters
    public void setId(String id) { this.id = id; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public void setUsername(String username) { this.username = username; }
    public void setPicture(String picture) { this.picture = picture; }
    public void setPhone(String phone) { this.phone = phone; }
    public void setBirthday(String birthday) { this.birthday = birthday; }
    public void setGender(String gender) { this.gender = gender; }

    public String getDisplayName() {
        if (firstName != null && lastName != null) {
            return firstName + " " + lastName;
        } else if (firstName != null) {
            return firstName;
        } else if (username != null) {
            return username;
        }
        return "User";
    }
} 