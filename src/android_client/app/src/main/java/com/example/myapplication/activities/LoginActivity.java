package com.example.myapplication.activities;

import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.example.myapplication.MainActivity;
import com.example.myapplication.R;
import com.example.myapplication.api.ApiClient;
import com.example.myapplication.api.ApiService;
import com.example.myapplication.utils.AuthManager;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class LoginActivity extends AppCompatActivity {

    private EditText etUsername;
    private EditText etPassword;
    private Button btnLogin;
    private ProgressBar progressBar;
    private TextView tvError;
    private TextView tvCreateAccount;
    private ApiService apiService;
    private AuthManager authManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        // Check if user is already logged in
        authManager = AuthManager.getInstance(this);
        if (authManager.isLoggedIn()) {
            navigateToMainActivity();
            return;
        }

        initializeViews();
        setupAPI();
        setupClickListeners();
    }

    private void initializeViews() {
        etUsername = findViewById(R.id.et_username);
        etPassword = findViewById(R.id.et_password);
        btnLogin = findViewById(R.id.btn_login);
        progressBar = findViewById(R.id.progress_bar);
        tvError = findViewById(R.id.tv_error);
        tvCreateAccount = findViewById(R.id.tv_create_account);
    }

    private void setupAPI() {
        apiService = ApiClient.getInstance().getApiService();
    }

    private void setupClickListeners() {
        btnLogin.setOnClickListener(v -> attemptLogin());
        tvCreateAccount.setOnClickListener(v -> navigateToRegister());
    }

    private void attemptLogin() {
        String username = etUsername.getText().toString().trim();
        String password = etPassword.getText().toString().trim();

        // Validate input
        if (TextUtils.isEmpty(username)) {
            etUsername.setError("Username is required");
            etUsername.requestFocus();
            return;
        }

        if (TextUtils.isEmpty(password)) {
            etPassword.setError("Password is required");
            etPassword.requestFocus();
            return;
        }

        // Show loading state
        setLoadingState(true);
        clearError();

        // Create login request
        ApiService.LoginRequest loginRequest = new ApiService.LoginRequest(username, password);

        // Make API call
        Call<ApiService.LoginResponse> call = apiService.login(loginRequest);
        call.enqueue(new Callback<ApiService.LoginResponse>() {
            @Override
            public void onResponse(Call<ApiService.LoginResponse> call, Response<ApiService.LoginResponse> response) {
                setLoadingState(false);
                
                if (response.isSuccessful() && response.body() != null) {
                    ApiService.LoginResponse loginResponse = response.body();
                    
                    if ("success".equals(loginResponse.getStatus())) {
                        // Save token and user info
                        authManager.saveAuthToken(loginResponse.getToken());
                        authManager.saveUsername(loginResponse.getUsername());
                        
                        // Navigate to main activity
                        navigateToMainActivity();
                        
                        Toast.makeText(LoginActivity.this, "Login successful", Toast.LENGTH_SHORT).show();
                    } else {
                        showError(loginResponse.getMessage() != null ? loginResponse.getMessage() : "Login failed");
                    }
                } else {
                    // Handle error response
                    String errorMessage = "Login failed. Please check your credentials.";
                    if (response.code() == 401) {
                        errorMessage = "Invalid username or password";
                    } else if (response.code() == 500) {
                        errorMessage = "Server error. Please try again later.";
                    }
                    showError(errorMessage);
                }
            }

            @Override
            public void onFailure(Call<ApiService.LoginResponse> call, Throwable t) {
                setLoadingState(false);
                showError("Network error. Please check your connection.");
            }
        });
    }

    private void setLoadingState(boolean isLoading) {
        progressBar.setVisibility(isLoading ? View.VISIBLE : View.GONE);
        btnLogin.setEnabled(!isLoading);
        etUsername.setEnabled(!isLoading);
        etPassword.setEnabled(!isLoading);
    }

    private void showError(String message) {
        tvError.setText(message);
        tvError.setVisibility(View.VISIBLE);
    }

    private void clearError() {
        tvError.setVisibility(View.GONE);
    }



    private void navigateToMainActivity() {
        Intent intent = new Intent(LoginActivity.this, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
        finish();
    }

    private void navigateToRegister() {
        Intent intent = new Intent(LoginActivity.this, RegisterActivity.class);
        startActivity(intent);
    }
} 