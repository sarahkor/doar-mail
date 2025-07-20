package com.example.myapplication.utils;

import android.content.Context;
import android.content.SharedPreferences;

public class AuthManager {
    private static final String PREF_NAME = "UserSession";
    private static final String KEY_AUTH_TOKEN = "auth_token";
    private static final String KEY_USERNAME = "username";
    private static final String KEY_IS_LOGGED_IN = "is_logged_in";

    private static AuthManager instance;
    private SharedPreferences prefs;

    private AuthManager(Context context) {
        prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
    }

    public static synchronized AuthManager getInstance(Context context) {
        if (instance == null) {
            instance = new AuthManager(context.getApplicationContext());
        }
        return instance;
    }

    public void saveAuthToken(String token) {
        prefs.edit()
                .putString(KEY_AUTH_TOKEN, token)
                .putBoolean(KEY_IS_LOGGED_IN, true)
                .apply();
    }

    public void saveUsername(String username) {
        prefs.edit()
                .putString(KEY_USERNAME, username)
                .apply();
    }

    public String getAuthToken() {
        return prefs.getString(KEY_AUTH_TOKEN, null);
    }


    public String getUsername() {
        return prefs.getString(KEY_USERNAME, null);
    }

    public boolean isLoggedIn() {
        return prefs.getBoolean(KEY_IS_LOGGED_IN, false)
                && getAuthToken() != null;
    }

    public void logout() {
        prefs.edit().clear().apply();
    }

    public String getBearerToken() {
        String token = getAuthToken();
        return token != null ? "Bearer " + token : null;
    }
}