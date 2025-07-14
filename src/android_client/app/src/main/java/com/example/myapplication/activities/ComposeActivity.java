package com.example.myapplication.activities;

import android.os.Bundle;
import android.text.TextUtils;
import android.view.View;
import android.view.WindowManager;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.example.myapplication.R;
import com.example.myapplication.api.ApiClient;
import com.example.myapplication.api.ApiService;
import com.example.myapplication.models.Mail;
import com.example.myapplication.utils.AuthManager;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ComposeActivity extends AppCompatActivity {

    private EditText etTo, etSubject, etBody;
    private ImageButton btnSend;
    private ApiService apiService;
    private AuthManager authManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_compose);

        // Initialize API and auth
        apiService = ApiClient.getInstance().getApiService();
        authManager = AuthManager.getInstance(this);

        // Initialize input fields
        etTo = findViewById(R.id.et_to);
        etSubject = findViewById(R.id.et_subject);
        etBody = findViewById(R.id.et_body);

        // Initialize icon buttons
        btnSend = findViewById(R.id.btn_send);
        ImageButton btnAttach = findViewById(R.id.btn_attach);
        ImageButton btnDelete = findViewById(R.id.btn_delete);
        ImageButton btnClose = findViewById(R.id.btn_close);

        // Set focus to 'To' field and show keyboard manually
        etTo.requestFocus();
        etTo.postDelayed(() -> {
            etTo.requestFocus();
            getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE);
            android.view.inputmethod.InputMethodManager imm =
                    (android.view.inputmethod.InputMethodManager) getSystemService(INPUT_METHOD_SERVICE);
            if (imm != null) {
                imm.showSoftInput(etTo, android.view.inputmethod.InputMethodManager.SHOW_IMPLICIT);
            }
        }, 150); // small delay ensures keyboard pops after layout

        // Handle send icon
        btnSend.setOnClickListener(v -> sendMail());

        btnAttach.setOnClickListener(v ->
                Toast.makeText(this, "Attach clicked (not implemented)", Toast.LENGTH_SHORT).show()
        );

        btnDelete.setOnClickListener(v -> {
            etTo.setText("");
            etSubject.setText("");
            etBody.setText("");
            Toast.makeText(this, "Fields cleared", Toast.LENGTH_SHORT).show();
        });

        // Long click on delete button to fill with test data for easy testing
        btnDelete.setOnLongClickListener(v -> {
            fillTestData();
            return true;
        });

        btnClose.setOnClickListener(v -> finish());
    }


    private void sendMail() {
        String to = etTo.getText().toString().trim();
        String subject = etSubject.getText().toString().trim();
        String body = etBody.getText().toString().trim();

        if (TextUtils.isEmpty(to) || TextUtils.isEmpty(subject) || TextUtils.isEmpty(body)) {
            Toast.makeText(this, "Please fill all fields", Toast.LENGTH_SHORT).show();
            return;
        }

        // Validate email format for Doar
        if (!to.endsWith("@doar.com")) {
            Toast.makeText(this, "You can only send mail to Doar users. Please use an @doar.com address.", Toast.LENGTH_LONG).show();
            return;
        }

        // Show loading state
        setLoadingState(true);

        // Create mail request
        ApiService.CreateMailRequest mailRequest = new ApiService.CreateMailRequest(
                to, 
                subject.isEmpty() ? "(no subject)" : subject, 
                body, 
                "sent"
        );

        // Send mail via API
        Call<Mail> call = apiService.createMail(authManager.getBearerToken(), mailRequest);
        call.enqueue(new Callback<Mail>() {
            @Override
            public void onResponse(Call<Mail> call, Response<Mail> response) {
                setLoadingState(false);
                
                if (response.isSuccessful() && response.body() != null) {
                    Mail createdMail = response.body();
                    
                    // Check if mail was delivered to spam
                    String message = "Mail sent successfully!";
                    if ("spam".equals(createdMail.getStatus())) {
                        message = "Mail sent but delivered to spam due to blacklisted content.";
                    }
                    
                    Toast.makeText(ComposeActivity.this, message, Toast.LENGTH_LONG).show();
                    setResult(RESULT_OK); // Set result for MainActivity to refresh
                    finish(); // Close the compose activity
                    
                } else {
                    // Handle different error codes
                    String errorMessage = "Failed to send mail.";
                    
                    if (response.code() == 400) {
                        errorMessage = "Invalid email data. Please check the recipient address.";
                    } else if (response.code() == 401) {
                        errorMessage = "Authentication failed. Please login again.";
                    } else if (response.code() == 404) {
                        errorMessage = "Recipient not found. Please check the email address.";
                    } else if (response.code() == 500) {
                        errorMessage = "Server error. Please try again later.";
                    }
                    
                    Toast.makeText(ComposeActivity.this, errorMessage, Toast.LENGTH_LONG).show();
                }
            }

            @Override
            public void onFailure(Call<Mail> call, Throwable t) {
                setLoadingState(false);
                Toast.makeText(ComposeActivity.this, "Network error. Please check your connection.", Toast.LENGTH_LONG).show();
            }
        });
    }
    
    private void setLoadingState(boolean loading) {
        btnSend.setEnabled(!loading);
        etTo.setEnabled(!loading);
        etSubject.setEnabled(!loading);
        etBody.setEnabled(!loading);
        
        if (loading) {
            btnSend.setAlpha(0.5f);
        } else {
            btnSend.setAlpha(1.0f);
        }
    }

    private void fillTestData() {
        etTo.setText("test@doar.com");
        etSubject.setText("Test Subject");
        etBody.setText("This is a test message. Please do not reply.");
        Toast.makeText(this, "Test data filled", Toast.LENGTH_SHORT).show();
    }
}
