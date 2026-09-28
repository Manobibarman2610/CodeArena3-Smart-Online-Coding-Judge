package com.codearena.dto;

public class LoginRequest {
    private String email;
    private String username;
    private String identifier;
    private String password;

    public LoginRequest() {}

    public LoginRequest(String email, String password) {
        this.email = email;
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getIdentifier() {
        return identifier;
    }

    public void setIdentifier(String identifier) {
        this.identifier = identifier;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEffectiveIdentifier() {
        if (email != null && !email.trim().isEmpty()) {
            return email.trim();
        }
        if (username != null && !username.trim().isEmpty()) {
            return username.trim();
        }
        if (identifier != null && !identifier.trim().isEmpty()) {
            return identifier.trim();
        }
        return "";
    }
}
