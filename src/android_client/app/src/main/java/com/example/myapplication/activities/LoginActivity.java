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
import androidx.lifecycle.ViewModelProvider;

import com.example.myapplication.MainActivity;
import com.example.myapplication.R;
import com.example.myapplication.api.ApiClient;
import com.example.myapplication.api.ApiService;
import com.example.myapplication.utils.AuthManager;
import com.example.myapplication.viewModel.LoginViewModel;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import android.util.Log;

public class LoginActivity extends AppCompatActivity {

    private EditText etUsername;
    private EditText etPassword;
    private Button btnLogin;
    private ProgressBar progressBar;
    private TextView tvError;
    private TextView tvCreateAccount;
    private ApiService apiService;
    private AuthManager authManager;
    private LoginViewModel loginViewModel;

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
        loginViewModel = new ViewModelProvider(this).get(LoginViewModel.class);
        observeViewModel();
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
        btnLogin.setOnClickListener(v -> {
            String username = etUsername.getText().toString().trim();
            String password = etPassword.getText().toString().trim();
            loginViewModel.login(username, password);
        });
        tvCreateAccount.setOnClickListener(v -> navigateToRegister());
    }

    private void observeViewModel() {
        loginViewModel.getLoading().observe(this, isLoading -> setLoadingState(isLoading != null && isLoading));
        loginViewModel.getErrorMessage().observe(this, error -> {
            if (error != null && !error.isEmpty()) showError(error);
            else clearError();
        });
        loginViewModel.getLoginSuccess().observe(this, success -> {
            if (success != null && success) {
                // Now handled in authToken/usernameLive observers
            }
        });
        loginViewModel.getAuthToken().observe(this, token -> {
            if (token != null && !token.isEmpty()) {
                authManager.saveAuthToken(token);
                // Save username as well if available
                String username = loginViewModel.getUsernameLive().getValue();
                if (username != null && !username.isEmpty()) {
                    authManager.saveUsername(username);
                }
                // Fetch latest user details before navigating to MainActivity
                apiService.getCurrentUser(authManager.getBearerToken()).enqueue(new Callback<ApiService.UserResponse>() {
                    @Override
                    public void onResponse(Call<ApiService.UserResponse> call, Response<ApiService.UserResponse> response) {
                        if (response.isSuccessful() && response.body() != null) {
                            ApiService.UserResponse userResponse = response.body();
                            if (userResponse.getUser() != null) {
                                Log.d("ProfilePhoto", "Fetched user after login: picture=" + userResponse.getUser().getPicture());
                            }
                        }
                        navigateToMainActivity();
                    }
                    @Override
                    public void onFailure(Call<ApiService.UserResponse> call, Throwable t) {
                        Log.d("ProfilePhoto", "Failed to fetch user after login: " + t.getMessage());
                        navigateToMainActivity();
                    }
                });
                Toast.makeText(LoginActivity.this, "Login successful", Toast.LENGTH_SHORT).show();
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