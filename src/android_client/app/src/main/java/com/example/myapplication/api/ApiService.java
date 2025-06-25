package com.example.myapplication.api;

import com.example.myapplication.models.Mail;
import com.example.myapplication.models.User;

import java.util.List;

import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.Header;
import retrofit2.http.POST;
import retrofit2.http.Body;
import retrofit2.http.Query;

public interface ApiService {
    
    // Authentication
    @POST("api/users/tokens")
    Call<LoginResponse> login(@Body LoginRequest loginRequest);
    
    // User profile
    @GET("api/users/me")
    Call<UserResponse> getCurrentUser(@Header("Authorization") String token);
    
    // Mail operations
    @GET("api/mails")
    Call<List<Mail>> getMails(@Header("Authorization") String token);
    
    @GET("api/mails/all")
    Call<List<Mail>> getAllMails(@Header("Authorization") String token);
    
    @GET("api/inbox")
    Call<List<Mail>> getInbox(@Header("Authorization") String token);
    
    @GET("api/sent")
    Call<List<Mail>> getSent(@Header("Authorization") String token);
    
    @GET("api/drafts")
    Call<List<Mail>> getDrafts(@Header("Authorization") String token);
    
    @GET("api/starred")
    Call<List<Mail>> getStarred(@Header("Authorization") String token);
    
    @GET("api/spam")
    Call<List<Mail>> getSpam(@Header("Authorization") String token);
    
    @GET("api/trash")
    Call<List<Mail>> getTrash(@Header("Authorization") String token);
    
    // Search
    @GET("api/search")
    Call<SearchResponse> searchMails(
        @Header("Authorization") String token,
        @Query("q") String query,
        @Query("subject") String subject,
        @Query("from") String from,
        @Query("to") String to,
        @Query("content") String content
    );
    
    // Response models
    class LoginRequest {
        private String username;
        private String password;
        
        public LoginRequest(String username, String password) {
            this.username = username;
            this.password = password;
        }
        
        public String getUsername() { return username; }
        public String getPassword() { return password; }
    }
    
    class LoginResponse {
        private String status;
        private String token;
        private String message;
        
        public String getStatus() { return status; }
        public String getToken() { return token; }
        public String getMessage() { return message; }
    }
    
    class UserResponse {
        private String status;
        private User user;
        
        public String getStatus() { return status; }
        public User getUser() { return user; }
    }
    
    class SearchResponse {
        private List<Mail> results;
        private int count;
        
        public List<Mail> getResults() { return results; }
        public int getCount() { return count; }
    }
} 