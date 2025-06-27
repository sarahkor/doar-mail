package com.example.myapplication.dao;

import androidx.lifecycle.LiveData;
import androidx.room.Dao;
import androidx.room.Insert;
import androidx.room.Query;

import java.util.List;

import com.example.myapplication.models.Mail;

@Dao
public interface MailDao {
    // Get all mails from the database
    @Query("SELECT * FROM mail")
    LiveData<List<Mail>> getAllMails();

    // Insert a new mail
    @Insert
    void insertMail(Mail mail);
}
