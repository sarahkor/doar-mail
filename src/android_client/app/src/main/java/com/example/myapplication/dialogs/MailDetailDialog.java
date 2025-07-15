package com.example.myapplication.dialogs;

import android.app.Dialog;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AlertDialog;
import androidx.fragment.app.DialogFragment;

import com.example.myapplication.MailFolder;
import com.example.myapplication.R;
import com.example.myapplication.api.ApiClient;
import com.example.myapplication.api.ApiService;
import com.example.myapplication.models.Mail;
import com.example.myapplication.utils.AuthManager;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class MailDetailDialog extends DialogFragment {
    
    private static final String ARG_MAIL_ID = "mail_id";
    private static final String ARG_FOLDER = "folder";
    
    // UI Components
    private TextView tvSubject, tvFromName, tvFromEmail, tvToName, tvToEmail, tvDate, tvBody;
    private ImageButton btnStar, btnSpam, btnTrash, btnRestore;
    private LinearLayout toolbarActions, toContainer, attachmentsContainer, attachmentsList;
    
    // Data
    private ApiService apiService;
    private AuthManager authManager;
    private Mail currentMail;
    private String mailId;
    private MailFolder currentFolder;
    
    // Listeners
    private OnMailUpdatedListener onMailUpdatedListener;
    
    public interface OnMailUpdatedListener {
        void onMailUpdated();
    }
    
    public static MailDetailDialog newInstance(String mailId, MailFolder folder) {
        MailDetailDialog dialog = new MailDetailDialog();
        Bundle args = new Bundle();
        args.putString(ARG_MAIL_ID, mailId);
        args.putSerializable(ARG_FOLDER, folder);
        dialog.setArguments(args);
        return dialog;
    }
    
    public void setOnMailUpdatedListener(OnMailUpdatedListener listener) {
        this.onMailUpdatedListener = listener;
    }
    
    @NonNull
    @Override
    public Dialog onCreateDialog(Bundle savedInstanceState) {
        AlertDialog.Builder builder = new AlertDialog.Builder(requireContext());
        
        // Get arguments
        if (getArguments() != null) {
            mailId = getArguments().getString(ARG_MAIL_ID);
            currentFolder = (MailFolder) getArguments().getSerializable(ARG_FOLDER);
        }
        
        // Initialize API
        apiService = ApiClient.getInstance().getApiService();
        authManager = AuthManager.getInstance(requireContext());
        
        // Inflate the layout
        LayoutInflater inflater = requireActivity().getLayoutInflater();
        View view = inflater.inflate(R.layout.dialog_mail_detail, null);
        
        // Initialize views
        initViews(view);
        
        // Setup click listeners
        setupClickListeners();
        
        // Load mail data
        loadMailDetails();
        
        builder.setView(view);
        
        // Create dialog and make it dismissible by touching outside
        AlertDialog dialog = builder.create();
        dialog.setCanceledOnTouchOutside(true);
        
        return dialog;
    }
    
    private void initViews(View view) {
        // Subject and content
        tvSubject = view.findViewById(R.id.tv_subject);
        tvBody = view.findViewById(R.id.tv_body);
        tvDate = view.findViewById(R.id.tv_date);
        
        // From section
        tvFromName = view.findViewById(R.id.tv_from_name);
        tvFromEmail = view.findViewById(R.id.tv_from_email);
        
        // To section
        tvToName = view.findViewById(R.id.tv_to_name);
        tvToEmail = view.findViewById(R.id.tv_to_email);
        toContainer = view.findViewById(R.id.to_container);
        
        // Action buttons
        btnStar = view.findViewById(R.id.btn_star);
        btnSpam = view.findViewById(R.id.btn_spam);
        btnTrash = view.findViewById(R.id.btn_trash);
        btnRestore = view.findViewById(R.id.btn_restore);
        
        // Containers
        toolbarActions = view.findViewById(R.id.toolbar_actions);
        attachmentsContainer = view.findViewById(R.id.attachments_container);
        attachmentsList = view.findViewById(R.id.attachments_list);
    }
    
    private void setupClickListeners() {
        btnStar.setOnClickListener(v -> toggleStar());
        btnSpam.setOnClickListener(v -> toggleSpam());
        btnTrash.setOnClickListener(v -> moveToTrash());
        btnRestore.setOnClickListener(v -> restoreFromTrash());
    }
    
    private void loadMailDetails() {
        if (mailId == null) return;
        
        apiService.getMailById(authManager.getBearerToken(), mailId)
                .enqueue(new Callback<Mail>() {
                    @Override
                    public void onResponse(Call<Mail> call, Response<Mail> response) {
                        if (response.isSuccessful() && response.body() != null) {
                            currentMail = response.body();
                            currentMail.convertIdFromString(); // Convert ObjectId to int
                            populateMailDetails();
                            loadStarredStatus(); // Load current starred status
                        } else {
                            showError("Failed to load mail details");
                            dismiss();
                        }
                    }
                    
                    @Override
                    public void onFailure(Call<Mail> call, Throwable t) {
                        showError("Network error: " + t.getMessage());
                        dismiss();
                    }
                });
    }
    
    private void populateMailDetails() {
        if (currentMail == null) return;
        
        // Subject - clean and simple
        String subject = currentMail.getDisplaySubject();
        if (subject == null || subject.trim().isEmpty()) {
            subject = "(No Subject)";
        }
        tvSubject.setText(subject);
        
        // From section
        String fromName = currentMail.getDisplayFrom();
        String fromEmail = currentMail.getFrom();
        tvFromName.setText(fromName != null ? fromName : "Unknown");
        tvFromEmail.setText(fromEmail != null ? "<" + fromEmail + ">" : "");
        
        // To section - only show if mail has recipient
        if (currentMail.getTo() != null && !currentMail.getTo().isEmpty()) {
            toContainer.setVisibility(View.VISIBLE);
            String toName = currentMail.getDisplayTo();
            String toEmail = currentMail.getTo();
            tvToName.setText(toName != null ? toName : "Unknown");
            tvToEmail.setText("<" + toEmail + ">");
        } else {
            toContainer.setVisibility(View.GONE);
        }
        
        // Date formatting
        formatAndSetDate();
        
        // Body content
        String bodyText = currentMail.getBodyPreview();
        if (bodyText == null || bodyText.trim().isEmpty()) {
            bodyText = "(No content)";
        }
        tvBody.setText(bodyText);
        
        // Configure action buttons based on folder
        configureActionButtons();
        
        // Load attachments if any
        loadAttachments();
    }
    
    private void formatAndSetDate() {
        try {
            if (currentMail.getTimestamp() > 0) {
                Date date = new Date(currentMail.getTimestamp());
                SimpleDateFormat formatter = new SimpleDateFormat("MMM d, yyyy 'at' h:mm a", Locale.getDefault());
                tvDate.setText(formatter.format(date));
            } else if (currentMail.getDate() != null && currentMail.getTime() != null) {
                tvDate.setText(currentMail.getDate() + " at " + currentMail.getTime());
            } else {
                tvDate.setText("Date not available");
            }
        } catch (Exception e) {
            tvDate.setText("Date not available");
        }
    }
    
    private void configureActionButtons() {
        if (currentFolder == null) return;
        
        // Reset all button visibility
        btnStar.setVisibility(View.VISIBLE);
        btnSpam.setVisibility(View.VISIBLE);
        btnTrash.setVisibility(View.VISIBLE);
        btnRestore.setVisibility(View.GONE);
        
        // Configure based on folder
        switch (currentFolder) {
            case TRASH:
                btnStar.setVisibility(View.GONE);
                btnSpam.setVisibility(View.GONE);
                btnRestore.setVisibility(View.VISIBLE);
                btnTrash.setImageResource(R.drawable.ic_delete); // Permanent delete icon
                break;
                
            case SPAM:
                // Show unspam instead of spam
                btnSpam.setImageResource(R.drawable.ic_restore);
                btnSpam.setContentDescription("Not Spam");
                break;
                
            default:
                // Regular folders
                btnSpam.setImageResource(R.drawable.ic_spam);
                btnSpam.setContentDescription("Report as Spam");
                break;
        }
        
        // Update star button based on current state
        updateStarButton();
    }
    
    private void updateStarButton() {
        if (currentMail != null) {
            btnStar.setImageResource(currentMail.isStarred() ? 
                R.drawable.ic_star_filled : R.drawable.ic_star_outline);
            btnStar.setContentDescription(currentMail.isStarred() ? 
                "Unstar mail" : "Star mail");
        }
    }
    
    private void loadStarredStatus() {
        if (mailId == null) return;
        
        apiService.isMailStarred(authManager.getBearerToken(), mailId)
                .enqueue(new Callback<ApiService.StarredResponse>() {
                    @Override
                    public void onResponse(Call<ApiService.StarredResponse> call, 
                                         Response<ApiService.StarredResponse> response) {
                        if (response.isSuccessful() && response.body() != null) {
                            currentMail.setStarred(response.body().isStarred());
                            updateStarButton();
                        }
                    }
                    
                    @Override
                    public void onFailure(Call<ApiService.StarredResponse> call, Throwable t) {
                        // Ignore failure for starred status - not critical
                    }
                });
    }
    
    private void loadAttachments() {
        if (currentMail.getAttachments() == null || currentMail.getAttachments().isEmpty()) {
            attachmentsContainer.setVisibility(View.GONE);
            return;
        }
        
        attachmentsContainer.setVisibility(View.VISIBLE);
        attachmentsList.removeAllViews();
        
        for (Mail.Attachment attachment : currentMail.getAttachments()) {
            TextView attachmentView = new TextView(requireContext());
            attachmentView.setText(attachment.getOriginalName());
            attachmentView.setTextColor(getResources().getColor(R.color.primary, getContext().getTheme()));
            attachmentView.setPadding(0, 8, 0, 8);
            attachmentView.setOnClickListener(v -> openAttachment(attachment));
            attachmentsList.addView(attachmentView);
        }
    }
    
    private void openAttachment(Mail.Attachment attachment) {
        if (attachment.getUrl() != null) {
            try {
                String baseUrl = "http://10.0.2.2:8080"; // Android emulator localhost
                String fullUrl = baseUrl + attachment.getUrl();
                Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(fullUrl));
                startActivity(intent);
            } catch (Exception e) {
                showError("Cannot open attachment");
            }
        }
    }
    
    private void toggleStar() {
        if (currentMail == null) return;
        
        // Optimistically update UI
        boolean newStarredState = !currentMail.isStarred();
        currentMail.setStarred(newStarredState);
        updateStarButton();
        
        // Call API to toggle star
        apiService.toggleStar(authManager.getBearerToken(), mailId)
                .enqueue(new Callback<ApiService.ToggleStarResponse>() {
                    @Override
                    public void onResponse(Call<ApiService.ToggleStarResponse> call, 
                                         Response<ApiService.ToggleStarResponse> response) {
                        if (response.isSuccessful() && response.body() != null) {
                            // Update with server response
                            currentMail.setStarred(response.body().isStarred());
                            updateStarButton();
                            notifyMailUpdated();
                        } else {
                            // Revert optimistic update on failure
                            currentMail.setStarred(!newStarredState);
                            updateStarButton();
                            showError("Failed to toggle star");
                        }
                    }
                    
                    @Override
                    public void onFailure(Call<ApiService.ToggleStarResponse> call, Throwable t) {
                        // Revert optimistic update on failure
                        currentMail.setStarred(!newStarredState);
                        updateStarButton();
                        showError("Network error: " + t.getMessage());
                    }
                });
    }
    
    private void toggleSpam() {
        if (currentMail == null) return;
        
        if (currentFolder == MailFolder.SPAM) {
            // Unspam
            apiService.unmarkAsSpam(authManager.getBearerToken(), mailId)
                    .enqueue(new Callback<ApiService.ApiResponse>() {
                        @Override
                        public void onResponse(Call<ApiService.ApiResponse> call, Response<ApiService.ApiResponse> response) {
                            if (response.isSuccessful()) {
                                showError("Mail unmarked as spam");
                                notifyMailUpdated();
                                dismiss();
                            } else {
                                showError("Failed to unmark as spam");
                            }
                        }

                        @Override
                        public void onFailure(Call<ApiService.ApiResponse> call, Throwable t) {
                            showError("Network error: " + t.getMessage());
                        }
                    });
        } else {
            // Report as spam
            apiService.markAsSpam(authManager.getBearerToken(), mailId)
                    .enqueue(new Callback<ApiService.ApiResponse>() {
                        @Override
                        public void onResponse(Call<ApiService.ApiResponse> call, Response<ApiService.ApiResponse> response) {
                            if (response.isSuccessful()) {
                                showError("Mail marked as spam");
                                notifyMailUpdated();
                                dismiss();
                            } else {
                                showError("Failed to mark as spam");
                            }
                        }

                        @Override
                        public void onFailure(Call<ApiService.ApiResponse> call, Throwable t) {
                            showError("Network error: " + t.getMessage());
                        }
                    });
        }
    }
    
    private void moveToTrash() {
        if (currentMail == null) return;
        
        if (currentFolder == MailFolder.TRASH) {
            // Permanent delete - show confirmation
            new AlertDialog.Builder(requireContext())
                    .setTitle("Permanently delete")
                    .setMessage("Are you sure you want to permanently delete this mail?")
                    .setPositiveButton("Delete", (dialog, which) -> {
                        permanentlyDeleteMail();
                    })
                    .setNegativeButton("Cancel", null)
                    .show();
        } else {
            // Move to trash
            moveMailToTrash();
        }
    }
    
    private void restoreFromTrash() {
        if (currentMail == null) return;
        
        apiService.restoreFromTrash(authManager.getBearerToken(), mailId)
                .enqueue(new Callback<ApiService.ApiResponse>() {
                    @Override
                    public void onResponse(Call<ApiService.ApiResponse> call, Response<ApiService.ApiResponse> response) {
                        if (response.isSuccessful()) {
                            showError("Mail restored from trash");
                            notifyMailUpdated();
                            dismiss();
                        } else {
                            showError("Failed to restore mail from trash");
                        }
                    }

                    @Override
                    public void onFailure(Call<ApiService.ApiResponse> call, Throwable t) {
                        showError("Network error: " + t.getMessage());
                    }
                });
    }
    
    private void moveMailToTrash() {
        apiService.moveToTrash(authManager.getBearerToken(), mailId)
                .enqueue(new Callback<ApiService.ApiResponse>() {
                    @Override
                    public void onResponse(Call<ApiService.ApiResponse> call, Response<ApiService.ApiResponse> response) {
                        if (response.isSuccessful()) {
                            showError("Mail moved to trash");
                            notifyMailUpdated();
                            dismiss();
                        } else {
                            showError("Failed to move mail to trash");
                        }
                    }

                    @Override
                    public void onFailure(Call<ApiService.ApiResponse> call, Throwable t) {
                        showError("Network error: " + t.getMessage());
                    }
                });
    }

    private void permanentlyDeleteMail() {
        apiService.permanentlyDelete(authManager.getBearerToken(), mailId)
                .enqueue(new Callback<ApiService.ApiResponse>() {
                    @Override
                    public void onResponse(Call<ApiService.ApiResponse> call, Response<ApiService.ApiResponse> response) {
                        if (response.isSuccessful()) {
                            showError("Mail permanently deleted");
                            notifyMailUpdated();
                            dismiss();
                        } else {
                            showError("Failed to permanently delete mail");
                        }
                    }

                    @Override
                    public void onFailure(Call<ApiService.ApiResponse> call, Throwable t) {
                        showError("Network error: " + t.getMessage());
                    }
                });
    }

    private void showError(String message) {
        Toast.makeText(requireContext(), message, Toast.LENGTH_SHORT).show();
    }
    
    private void notifyMailUpdated() {
        if (onMailUpdatedListener != null) {
            onMailUpdatedListener.onMailUpdated();
        }
    }
} 