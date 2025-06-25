package com.example.myapplication;

import android.app.Application;
import androidx.appcompat.app.AppCompatDelegate;

public class MyApplication extends Application {
    
    @Override
    public void onCreate() {
        super.onCreate();
        
        // Enable automatic dark mode switching based on system settings
        AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_FOLLOW_SYSTEM);
    }
} 