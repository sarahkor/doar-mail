package com.example.myapplication.viewModel;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;

import com.example.myapplication.api.ApiClient;
import com.example.myapplication.api.ApiService;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class LoginViewModel extends ViewModel {
    private final MutableLiveData<Boolean> loginSuccess = new MutableLiveData<>();
    private final MutableLiveData<String> errorMessage = new MutableLiveData<>();
    private final MutableLiveData<Boolean> loading = new MutableLiveData<>(false);
    private final MutableLiveData<String> authToken = new MutableLiveData<>();
    private final MutableLiveData<String> usernameLive = new MutableLiveData<>();
    private final ApiService apiService = ApiClient.getInstance().getApiService();

    public LiveData<Boolean> getLoginSuccess() {
        return loginSuccess;
    }

    public LiveData<String> getErrorMessage() {
        return errorMessage;
    }

    public LiveData<Boolean> getLoading() {
        return loading;
    }

    public LiveData<String> getAuthToken() {
        return authToken;
    }
    public LiveData<String> getUsernameLive() {
        return usernameLive;
    }

    public void login(String username, String password) {
        if (username == null || username.isEmpty()) {
            errorMessage.setValue("Username is required");
            return;
        }
        if (password == null || password.isEmpty()) {
            errorMessage.setValue("Password is required");
            return;
        }
        loading.setValue(true);
        errorMessage.setValue("");
        ApiService.LoginRequest loginRequest = new ApiService.LoginRequest(username, password);
        Call<ApiService.LoginResponse> call = apiService.login(loginRequest);
        call.enqueue(new Callback<ApiService.LoginResponse>() {
            @Override
            public void onResponse(Call<ApiService.LoginResponse> call, Response<ApiService.LoginResponse> response) {
                loading.setValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    ApiService.LoginResponse loginResponse = response.body();
                    if ("success".equals(loginResponse.getStatus())) {
                        loginSuccess.setValue(true);
                        authToken.setValue(loginResponse.getToken());
                        usernameLive.setValue(loginResponse.getUsername());
                    } else {
                        errorMessage.setValue(loginResponse.getMessage() != null ? loginResponse.getMessage() : "Login failed");
                    }
                } else {
                    String errorMsg = "Login failed. Please check your credentials.";
                    if (response.code() == 401) {
                        errorMsg = "Invalid username or password";
                    } else if (response.code() == 500) {
                        errorMsg = "Server error. Please try again later.";
                    }
                    errorMessage.setValue(errorMsg);
                }
            }
            @Override
            public void onFailure(Call<ApiService.LoginResponse> call, Throwable t) {
                loading.setValue(false);
                errorMessage.setValue("Network error. Please check your connection.");
            }
        });
    }
} 