package com.example.myapplication.repository;

import android.content.Context;

import androidx.lifecycle.LiveData;
import androidx.room.Room;

import java.util.List;

import com.example.myapplication.dao.MailDao;
import com.example.myapplication.database.AppDatabase;
import com.example.myapplication.models.Mail;

public class MailRepository {
    private final MailDao mailDao;

    // Constructor
    public MailRepository(Context context) {
        AppDatabase db = Room.databaseBuilder(
                        context.getApplicationContext(),
                        AppDatabase.class,
                        "doar_app_db"           // Name of the database file
                )
                .fallbackToDestructiveMigration()
                .build();

        this.mailDao = db.mailDao();
    }

    // Get all mails
    public LiveData<List<Mail>> getAllMails() {
        return mailDao.getAllMails();
    }

    // Insert a mail
    public void insertMail(final Mail mail) {
        new Thread(() -> mailDao.insertMail(mail)).start();
    }
}
