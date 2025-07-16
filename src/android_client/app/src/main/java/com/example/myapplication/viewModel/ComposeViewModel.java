package com.example.myapplication.viewModel;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;

import com.example.myapplication.api.ApiClient;
import com.example.myapplication.api.ApiService;
import com.example.myapplication.models.Mail;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ComposeViewModel extends ViewModel {
    private final MutableLiveData<Boolean> sendSuccess = new MutableLiveData<>();
    private final MutableLiveData<Boolean> draftSuccess = new MutableLiveData<>();
    private final MutableLiveData<String> errorMessage = new MutableLiveData<>();
    private final MutableLiveData<Boolean> loading = new MutableLiveData<>(false);
    private final MutableLiveData<String> sendInfoMessage = new MutableLiveData<>();

    private final ApiService apiService = ApiClient.getInstance().getApiService();

    public LiveData<Boolean> getSendSuccess() { return sendSuccess; }
    public LiveData<Boolean> getDraftSuccess() { return draftSuccess; }
    public LiveData<String> getErrorMessage() { return errorMessage; }
    public LiveData<Boolean> getLoading() { return loading; }
    public LiveData<String> getSendInfoMessage() { return sendInfoMessage; }

    public void sendMail(String bearerToken, String to, String subject, String body) {
        loading.setValue(true);
        errorMessage.setValue("");
        sendSuccess.setValue(false);
        sendInfoMessage.setValue("");
        ApiService.CreateMailRequest mailRequest = new ApiService.CreateMailRequest(
                to,
                subject.isEmpty() ? "(no subject)" : subject,
                body,
                "sent"
        );
        Call<Mail> call = apiService.createMail(bearerToken, mailRequest);
        call.enqueue(new Callback<Mail>() {
            @Override
            public void onResponse(Call<Mail> call, Response<Mail> response) {
                loading.setValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    Mail createdMail = response.body();
                    sendSuccess.setValue(true);
                    if ("spam".equals(createdMail.getStatus())) {
                        sendInfoMessage.setValue("Mail sent but delivered to spam due to blacklisted content.");
                    } else {
                        sendInfoMessage.setValue("Mail sent successfully!");
                    }
                } else {
                    handleSendError(response.code());
                }
            }
            @Override
            public void onFailure(Call<Mail> call, Throwable t) {
                loading.setValue(false);
                errorMessage.setValue("Network error. Please check your connection.");
            }
        });
    }

    public void updateDraftToSent(String bearerToken, String mailId, String to, String subject, String body) {
        loading.setValue(true);
        errorMessage.setValue("");
        sendSuccess.setValue(false);
        sendInfoMessage.setValue("");
        ApiService.UpdateMailRequest updateRequest = new ApiService.UpdateMailRequest(
                to,
                subject.isEmpty() ? "(no subject)" : subject,
                body,
                "sent"
        );
        Call<Void> call = apiService.updateMail(bearerToken, mailId, updateRequest);
        call.enqueue(new Callback<Void>() {
            @Override
            public void onResponse(Call<Void> call, Response<Void> response) {
                loading.setValue(false);
                if (response.isSuccessful()) {
                    sendSuccess.setValue(true);
                    sendInfoMessage.setValue("Mail sent successfully!");
                } else {
                    handleSendError(response.code());
                }
            }
            @Override
            public void onFailure(Call<Void> call, Throwable t) {
                loading.setValue(false);
                errorMessage.setValue("Network error. Please check your connection.");
            }
        });
    }

    public void createDraft(String bearerToken, String to, String subject, String body) {
        loading.setValue(true);
        errorMessage.setValue("");
        draftSuccess.setValue(false);
        ApiService.CreateMailRequest mailRequest = new ApiService.CreateMailRequest(
                to,
                subject.isEmpty() ? "(no subject)" : subject,
                body,
                "draft"
        );
        Call<Mail> call = apiService.createMail(bearerToken, mailRequest);
        call.enqueue(new Callback<Mail>() {
            @Override
            public void onResponse(Call<Mail> call, Response<Mail> response) {
                loading.setValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    draftSuccess.setValue(true);
                } else {
                    handleDraftError(response.code());
                }
            }
            @Override
            public void onFailure(Call<Mail> call, Throwable t) {
                loading.setValue(false);
                errorMessage.setValue("Network error. Please check your connection.");
            }
        });
    }

    public void updateDraft(String bearerToken, String mailId, String to, String subject, String body) {
        loading.setValue(true);
        errorMessage.setValue("");
        draftSuccess.setValue(false);
        ApiService.UpdateMailRequest updateRequest = new ApiService.UpdateMailRequest(
                to,
                subject.isEmpty() ? "(no subject)" : subject,
                body,
                "draft"
        );
        Call<Void> call = apiService.updateMail(bearerToken, mailId, updateRequest);
        call.enqueue(new Callback<Void>() {
            @Override
            public void onResponse(Call<Void> call, Response<Void> response) {
                loading.setValue(false);
                if (response.isSuccessful()) {
                    draftSuccess.setValue(true);
                } else {
                    handleDraftError(response.code());
                }
            }
            @Override
            public void onFailure(Call<Void> call, Throwable t) {
                loading.setValue(false);
                errorMessage.setValue("Network error. Please check your connection.");
            }
        });
    }

    private void handleSendError(int responseCode) {
        String errorMsg = "Failed to send mail. Please try again.";
        if (responseCode == 400) {
            errorMsg = "Invalid mail data.";
        } else if (responseCode == 401) {
            errorMsg = "Unauthorized. Please log in again.";
        } else if (responseCode == 500) {
            errorMsg = "Server error. Please try again later.";
        }
        errorMessage.setValue(errorMsg);
    }

    private void handleDraftError(int responseCode) {
        String errorMsg = "Failed to save draft. Please try again.";
        if (responseCode == 400) {
            errorMsg = "Invalid draft data.";
        } else if (responseCode == 401) {
            errorMsg = "Unauthorized. Please log in again.";
        } else if (responseCode == 500) {
            errorMsg = "Server error. Please try again later.";
        }
        errorMessage.setValue(errorMsg);
    }
} 