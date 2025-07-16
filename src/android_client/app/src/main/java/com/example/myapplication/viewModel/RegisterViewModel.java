package com.example.myapplication.viewModel;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;

import com.example.myapplication.api.ApiClient;
import com.example.myapplication.api.ApiService;

import okhttp3.MediaType;
import okhttp3.MultipartBody;
import okhttp3.RequestBody;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class RegisterViewModel extends ViewModel {
    private final MutableLiveData<Boolean> registerSuccess = new MutableLiveData<>();
    private final MutableLiveData<String> errorMessage = new MutableLiveData<>();
    private final MutableLiveData<Boolean> loading = new MutableLiveData<>(false);

    private final ApiService apiService = ApiClient.getInstance().getApiService();

    public LiveData<Boolean> getRegisterSuccess() {
        return registerSuccess;
    }

    public LiveData<String> getErrorMessage() {
        return errorMessage;
    }

    public LiveData<Boolean> getLoading() {
        return loading;
    }

    public void register(String firstName, String lastName, String username, String password, String birthDate, String gender, String photoFilePath, String photoMimeType) {
        loading.setValue(true);
        errorMessage.setValue("");
        registerSuccess.setValue(false);

        // Prepare multipart request bodies
        RequestBody firstNameBody = RequestBody.create(MediaType.parse("text/plain"), firstName);
        RequestBody lastNameBody = RequestBody.create(MediaType.parse("text/plain"), lastName);
        RequestBody usernameBody = RequestBody.create(MediaType.parse("text/plain"), username);
        RequestBody passwordBody = RequestBody.create(MediaType.parse("text/plain"), password);
        RequestBody birthdayBody = RequestBody.create(MediaType.parse("text/plain"), birthDate);
        RequestBody genderBody = RequestBody.create(MediaType.parse("text/plain"), gender);
        MultipartBody.Part photoPart = null;
        if (photoFilePath != null && !photoFilePath.isEmpty() && photoMimeType != null) {
            try {
                java.io.File file = new java.io.File(photoFilePath);
                RequestBody reqFile = RequestBody.create(MediaType.parse(photoMimeType), file);
                photoPart = MultipartBody.Part.createFormData("profilePicture", file.getName(), reqFile);
            } catch (Exception e) {
                loading.setValue(false);
                errorMessage.setValue("Failed to process selected photo");
                return;
            }
        }

        Call<ApiService.RegisterResponse> call = apiService.register(
                firstNameBody,
                lastNameBody,
                usernameBody,
                passwordBody,
                birthdayBody,
                genderBody,
                photoPart
        );
        call.enqueue(new Callback<ApiService.RegisterResponse>() {
            @Override
            public void onResponse(Call<ApiService.RegisterResponse> call, Response<ApiService.RegisterResponse> response) {
                loading.setValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    ApiService.RegisterResponse registerResponse = response.body();
                    if ("success".equals(registerResponse.getStatus())) {
                        registerSuccess.setValue(true);
                    } else {
                        errorMessage.setValue(registerResponse.getMessage() != null ? registerResponse.getMessage() : "Registration failed");
                    }
                } else {
                    String errorMsg = "Registration failed. Please try again.";
                    if (response.code() == 409) {
                        errorMsg = "Username already exists";
                    } else if (response.code() == 400) {
                        errorMsg = "Invalid registration data";
                    } else if (response.code() == 500) {
                        errorMsg = "Server error. Please try again later.";
                    }
                    errorMessage.setValue(errorMsg);
                }
            }
            @Override
            public void onFailure(Call<ApiService.RegisterResponse> call, Throwable t) {
                loading.setValue(false);
                errorMessage.setValue("Network error. Please check your connection.");
            }
        });
    }
} 