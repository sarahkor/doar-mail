package com.example.myapplication.api;

import android.net.Uri;
import com.example.myapplication.models.Mail;
import com.example.myapplication.models.User;
import com.example.myapplication.models.Label;

import java.util.List;

import okhttp3.MultipartBody;
import okhttp3.RequestBody;
import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.Header;
import retrofit2.http.POST;
import retrofit2.http.PUT;
import retrofit2.http.DELETE;
import retrofit2.http.Body;
import retrofit2.http.Part;
import retrofit2.http.Path;
import retrofit2.http.Query;
import retrofit2.http.Multipart;

public interface ApiService {
    
    // Authentication
    @POST("api/users/tokens")
    Call<LoginResponse> login(@Body LoginRequest loginRequest);
    
    @Multipart
    @POST("api/users")
    Call<RegisterResponse> register(
        @Part("firstName") RequestBody firstName,
        @Part("lastName") RequestBody lastName,
        @Part("username") RequestBody username,
        @Part("password") RequestBody password,
        @Part("birthday") RequestBody birthday,
        @Part("gender") RequestBody gender,
        @Part MultipartBody.Part profilePicture
    );
    

    
    // User profile
    @GET("api/users/me")
    Call<UserResponse> getCurrentUser(@Header("Authorization") String token);
    
    // Mail operations
    @GET("api/mails")
    Call<PaginatedMailResponse> getMails(@Header("Authorization") String token);
    
    @GET("api/mails/all")
    Call<PaginatedMailResponse> getAllMails(@Header("Authorization") String token);
    
    @GET("api/inbox")
    Call<PaginatedMailResponse> getInbox(@Header("Authorization") String token);
    
    @GET("api/sent")
    Call<PaginatedMailResponse> getSent(@Header("Authorization") String token);
    
    @GET("api/drafts")
    Call<PaginatedMailResponse> getDrafts(@Header("Authorization") String token);
    
    @GET("api/starred")
    Call<PaginatedMailResponse> getStarred(@Header("Authorization") String token);
    
    // Toggle star status
    @POST("api/starred/{id}")
    Call<ToggleStarResponse> toggleStar(@Header("Authorization") String token, @Path("id") String mailId);
    
    // Check if mail is starred
    @GET("api/starred/{id}")
    Call<StarredResponse> isMailStarred(@Header("Authorization") String token, @Path("id") String mailId);
    
    @GET("api/spam")
    Call<PaginatedMailResponse> getSpam(@Header("Authorization") String token);
    
    @GET("api/trash")
    Call<PaginatedMailResponse> getTrash(@Header("Authorization") String token);
    
    // Get individual mail details
    @GET("api/mails/{id}")
    Call<Mail> getMailById(@Header("Authorization") String token, @Path("id") String mailId);
    
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
    
    // Mail creation
    @POST("api/mails")
    Call<Mail> createMail(@Header("Authorization") String token, @Body CreateMailRequest request);
    
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
        private String username;
        
        public String getStatus() { return status; }
        public String getToken() { return token; }
        public String getMessage() { return message; }
        public String getUsername() { return username; }
    }
    
    class RegisterRequest {
        private String firstName;
        private String lastName;
        private String username;
        private String password;
        private String phone;
        private String birthday;
        private String gender;
        
        public RegisterRequest(String firstName, String lastName, String username, String password, String birthday, String gender, Uri profilePicture) {
            this.firstName = firstName;
            this.lastName = lastName;
            this.username = username;
            this.password = password;
            this.phone = null; // Optional field
            this.birthday = birthday;
            this.gender = gender;
        }
        
        public String getFirstName() { return firstName; }
        public String getLastName() { return lastName; }
        public String getUsername() { return username; }
        public String getPassword() { return password; }
        public String getPhone() { return phone; }
        public String getBirthday() { return birthday; }
        public String getGender() { return gender; }
    }
    
    class RegisterResponse {
        private String status;
        private String message;
        private User user;
        
        public String getStatus() { return status; }
        public String getMessage() { return message; }
        public User getUser() { return user; }
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
    
    // Mail creation request
    class CreateMailRequest {
        private String to;
        private String subject;
        private String bodyPreview;
        private String status;
        
        public CreateMailRequest(String to, String subject, String bodyPreview, String status) {
            this.to = to;
            this.subject = subject;
            this.bodyPreview = bodyPreview;
            this.status = status;
        }
        
        public String getTo() { return to; }
        public String getSubject() { return subject; }
        public String getBodyPreview() { return bodyPreview; }
        public String getStatus() { return status; }
    }
    
    // Paginated response wrapper for mail endpoints
    class PaginatedMailResponse {
        private int page;
        private int limit;
        private int total;
        private List<Mail> mails;
        
        public int getPage() { return page; }
        public int getLimit() { return limit; }
        public int getTotal() { return total; }
        public List<Mail> getMails() { return mails; }
        
        public void setPage(int page) { this.page = page; }
        public void setLimit(int limit) { this.limit = limit; }
        public void setTotal(int total) { this.total = total; }
        public void setMails(List<Mail> mails) { this.mails = mails; }
    }
    
    // Response for star toggle operation
    class ToggleStarResponse {
        private String message;
        private boolean starred;
        private String mailId;
        
        public String getMessage() { return message; }
        public boolean isStarred() { return starred; }
        public String getMailId() { return mailId; }
        
        public void setMessage(String message) { this.message = message; }
        public void setStarred(boolean starred) { this.starred = starred; }
        public void setMailId(String mailId) { this.mailId = mailId; }
    }
    
    // Response for checking starred status
    class StarredResponse {
        private boolean starred;
        
        public boolean isStarred() { return starred; }
        public void setStarred(boolean starred) { this.starred = starred; }
    }
} 