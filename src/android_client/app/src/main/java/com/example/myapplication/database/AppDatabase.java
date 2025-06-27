package com.example.myapplication.database;

import androidx.room.Database;
import androidx.room.RoomDatabase;

import com.example.myapplication.dao.MailDao;
import com.example.myapplication.models.Mail;

@Database(entities = {Mail.class}, version = 2, exportSchema = false)
public abstract class AppDatabase extends RoomDatabase {
    public abstract MailDao mailDao();
}
