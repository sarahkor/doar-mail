package com.example.myapplication.api;

import com.example.myapplication.models.Mail;
import com.example.myapplication.models.User;
import com.example.myapplication.models.Label;

import java.util.List;

import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.Header;
import retrofit2.http.POST;
import retrofit2.http.PUT;
import retrofit2.http.DELETE;
import retrofit2.http.Body;
import retrofit2.http.Path;
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
    
    // Label operations
    @GET("api/labels")
    Call<List<Label>> getLabels(@Header("Authorization") String token);
    
    @POST("api/labels")
    Call<Label> createLabel(@Header("Authorization") String token, @Body CreateLabelRequest request);
    
    @PUT("api/labels/{id}")
    Call<Label> updateLabel(@Header("Authorization") String token, @Path("id") int id, @Body UpdateLabelRequest request);
    
    @DELETE("api/labels/{id}")
    Call<ApiResponse> deleteLabel(@Header("Authorization") String token, @Path("id") int id);
    
    @PUT("api/labels/{id}/color")
    Call<Label> updateLabelColor(@Header("Authorization") String token, @Path("id") int id, @Body ColorRequest request);
    
    @POST("api/labels/{id}/mails/{mailId}")
    Call<ApiResponse> addMailToLabel(@Header("Authorization") String token, @Path("id") int labelId, @Path("mailId") int mailId);
    
    @DELETE("api/labels/{id}/mails/{mailId}")
    Call<ApiResponse> removeMailFromLabel(@Header("Authorization") String token, @Path("id") int labelId, @Path("mailId") int mailId);
    
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
    
    // Label request/response models
    class CreateLabelRequest {
        private String name;
        private String color;
        private Integer parentId;
        
        public CreateLabelRequest(String name, String color, Integer parentId) {
            this.name = name;
            this.color = color;
            this.parentId = parentId;
        }
        
        public String getName() { return name; }
        public String getColor() { return color; }
        public Integer getParentId() { return parentId; }
    }
    
    class UpdateLabelRequest {
        private String name;
        private Integer parentId;
        
        public UpdateLabelRequest(String name, Integer parentId) {
            this.name = name;
            this.parentId = parentId;
        }
        
        public String getName() { return name; }
        public Integer getParentId() { return parentId; }
    }
    
    class ColorRequest {
        private String color;
        
        public ColorRequest(String color) {
            this.color = color;
        }
        
        public String getColor() { return color; }
    }
    
    class ApiResponse {
        private String status;
        private String message;
        
        public String getStatus() { return status; }
        public String getMessage() { return message; }
    }
} 