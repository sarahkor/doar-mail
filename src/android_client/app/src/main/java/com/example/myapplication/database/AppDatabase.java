package com.example.myapplication.database;

import androidx.room.Database;
import androidx.room.RoomDatabase;
import androidx.room.TypeConverters;

import com.example.myapplication.dao.MailDao;
import com.example.myapplication.models.Converters;
import com.example.myapplication.models.Mail;

@Database(entities = {Mail.class}, version = 2, exportSchema = false)
@TypeConverters({Converters.class})
public abstract class AppDatabase extends RoomDatabase {
    public abstract MailDao mailDao();
}
