package com.example.myapplication.activities;

import android.os.Bundle;
import android.text.TextUtils;
import android.view.WindowManager;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;
import com.example.myapplication.viewModel.ComposeViewModel;

import com.example.myapplication.R;
import com.example.myapplication.api.ApiClient;
import com.example.myapplication.api.ApiService;
import com.example.myapplication.models.Mail;
import com.example.myapplication.utils.AuthManager;

import android.content.Intent;

public class ComposeActivity extends AppCompatActivity {

    private EditText etTo, etSubject, etBody;
    private ImageButton btnSend;
    private ApiService apiService;
    private AuthManager authManager;
    
    // Draft support fields
    private Mail existingDraft = null;
    private boolean isEditingDraft = false;

    private ComposeViewModel composeViewModel;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_compose);

        // Initialize API and auth
        apiService = ApiClient.getInstance().getApiService();
        authManager = AuthManager.getInstance(this);
        composeViewModel = new ViewModelProvider(this).get(ComposeViewModel.class);
        observeViewModel();

        // Initialize input fields
        etTo = findViewById(R.id.et_to);
        etSubject = findViewById(R.id.et_subject);
        etBody = findViewById(R.id.et_body);

        // Initialize icon buttons
        btnSend = findViewById(R.id.btn_send);
        ImageButton btnAttach = findViewById(R.id.btn_attach);
        ImageButton btnDelete = findViewById(R.id.btn_delete);
        ImageButton btnClose = findViewById(R.id.btn_close);
        
        // Check if we're editing an existing draft
        loadDraftFromIntent();

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

        btnClose.setOnClickListener(v -> saveDraftAndClose());
    }

    /**
     * Load draft data from intent if we're editing an existing draft
     */
    private void loadDraftFromIntent() {
        Intent intent = getIntent();
        if (intent != null && intent.hasExtra("draft_mail")) {
            existingDraft = (Mail) intent.getSerializableExtra("draft_mail");
            if (existingDraft != null) {
                isEditingDraft = true;
                
                // Populate fields with draft data
                etTo.setText(existingDraft.getTo() != null ? existingDraft.getTo() : "");
                etSubject.setText(existingDraft.getSubject() != null && !existingDraft.getSubject().equals("(no subject)") 
                    ? existingDraft.getSubject() : "");
                etBody.setText(existingDraft.getBodyPreview() != null && !existingDraft.getBodyPreview().equals("No content.") 
                    ? existingDraft.getBodyPreview() : "");
                
                // Update title to indicate we're editing a draft
                setTitle("Edit Draft");
            }
        }
    }

    /**
     * Save current email as draft and close the activity
     */
    private void saveDraftAndClose() {
        String to = etTo.getText().toString().trim();
        String subject = etSubject.getText().toString().trim();
        String body = etBody.getText().toString().trim();
        
        // Check if there's any content to save
        boolean hasContent = !to.isEmpty() || !subject.isEmpty() || !body.isEmpty();
        
        if (!hasContent) {
            // No content to save, just close
            finish();
            return;
        }
        
        // Validate email format if recipient is provided
        if (!to.isEmpty() && !to.endsWith("@doar.com")) {
            Toast.makeText(this, "You can only send mail to Doar users. Please use an @doar.com address.", Toast.LENGTH_LONG).show();
            return;
        }
        
        // If no recipient but has other content, show message
        if (to.isEmpty()) {
            Toast.makeText(this, "Please enter a recipient email address to save as draft.", Toast.LENGTH_LONG).show();
            return;
        }
        
        // Show loading state
        setLoadingState(true);
        
        if (isEditingDraft && existingDraft != null) {
            // Update existing draft
            composeViewModel.updateDraft(authManager.getBearerToken(), existingDraft.get_id(), to, subject, body);
        } else {
            // Create new draft
            composeViewModel.createDraft(authManager.getBearerToken(), to, subject, body);
        }
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

        if (isEditingDraft && existingDraft != null) {
            // Update existing draft to sent status
            composeViewModel.updateDraftToSent(authManager.getBearerToken(), existingDraft.get_id(), to, subject, body);
        } else {
            // Create and send new mail
            composeViewModel.sendMail(authManager.getBearerToken(), to, subject, body);
        }
    }
    
    private void observeViewModel() {
        composeViewModel.getLoading().observe(this, isLoading -> setLoadingState(isLoading != null && isLoading));
        composeViewModel.getErrorMessage().observe(this, error -> {
            if (error != null && !error.isEmpty())
                Toast.makeText(this, error, Toast.LENGTH_LONG).show();
        });
        composeViewModel.getSendInfoMessage().observe(this, info -> {
            if (info != null && !info.isEmpty())
                Toast.makeText(this, info, Toast.LENGTH_LONG).show();
        });
        composeViewModel.getSendSuccess().observe(this, success -> {
            if (success != null && success) {
                setResult(RESULT_OK);
                finish();
            }
        });
        composeViewModel.getDraftSuccess().observe(this, success -> {
            if (success != null && success) {
                setResult(RESULT_OK);
                finish();
            }
        });
    }
    
    /**
     * Handle send error responses
     */
    private void handleSendError(int responseCode) {
        String errorMessage = "Failed to send mail.";
        
        if (responseCode == 400) {
            errorMessage = "Invalid email data. Please check the recipient address.";
        } else if (responseCode == 401) {
            errorMessage = "Authentication failed. Please login again.";
        } else if (responseCode == 404) {
            errorMessage = "Recipient not found. Please check the email address.";
        } else if (responseCode == 500) {
            errorMessage = "Server error. Please try again later.";
        }
        
        Toast.makeText(ComposeActivity.this, errorMessage, Toast.LENGTH_LONG).show();
    }
    
    /**
     * Handle draft error responses
     */
    private void handleDraftError(int responseCode) {
        String errorMessage = "Failed to save draft.";
        
        if (responseCode == 400) {
            errorMessage = "Invalid draft data. Please check the recipient address.";
        } else if (responseCode == 401) {
            errorMessage = "Authentication failed. Please login again.";
        } else if (responseCode == 404) {
            errorMessage = "Recipient does not exist.";
        } else if (responseCode == 500) {
            errorMessage = "Server error. Please try again later.";
        }
        
        Toast.makeText(ComposeActivity.this, errorMessage, Toast.LENGTH_LONG).show();
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
