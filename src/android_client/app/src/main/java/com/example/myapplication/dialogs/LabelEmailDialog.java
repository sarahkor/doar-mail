package com.example.myapplication.dialogs;

import android.app.Dialog;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.CheckBox;
import android.widget.LinearLayout;
import android.widget.RadioButton;
import android.widget.RadioGroup;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AlertDialog;
import androidx.fragment.app.DialogFragment;

import com.example.myapplication.R;
import com.example.myapplication.api.ApiClient;
import com.example.myapplication.api.ApiService;
import com.example.myapplication.models.Label;
import com.example.myapplication.models.Mail;
import com.example.myapplication.utils.AuthManager;
import com.google.android.material.button.MaterialButton;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class LabelEmailDialog extends DialogFragment {
    
    private static final String ARG_MAIL_IDS = "mail_ids";
    private static final String ARG_IS_SINGLE_MAIL = "is_single_mail";
    private static final String ARG_MAIL_SUBJECT = "mail_subject";
    
    private RadioGroup labelsContainer;
    private MaterialButton btnCancel, btnApply;
    private TextView titleText;
    private OnLabelsAppliedListener listener;
    private ApiService apiService;
    private AuthManager authManager;
    
    private List<Label> allLabels = new ArrayList<>();
    private Set<Integer> mailIds = new HashSet<>();
    private boolean isSingleMail;
    private String mailSubject;

    public interface OnLabelsAppliedListener {
        void onLabelsApplied();
    }

    public static LabelEmailDialog newInstance(Set<Integer> mailIds, boolean isSingleMail, String mailSubject) {
        LabelEmailDialog dialog = new LabelEmailDialog();
        Bundle args = new Bundle();
        args.putIntegerArrayList(ARG_MAIL_IDS, new ArrayList<>(mailIds));
        args.putBoolean(ARG_IS_SINGLE_MAIL, isSingleMail);
        args.putString(ARG_MAIL_SUBJECT, mailSubject);
        dialog.setArguments(args);
        return dialog;
    }

    public static LabelEmailDialog newInstance(Mail mail) {
        Set<Integer> mailIds = new HashSet<>();
        mailIds.add(mail.getId());
        return newInstance(mailIds, true, mail.getDisplaySubject());
    }

    public void setOnLabelsAppliedListener(OnLabelsAppliedListener listener) {
        this.listener = listener;
    }

    @NonNull
    @Override
    public Dialog onCreateDialog(Bundle savedInstanceState) {
        AlertDialog.Builder builder = new AlertDialog.Builder(requireContext());
        LayoutInflater inflater = requireActivity().getLayoutInflater();
        
        View view = inflater.inflate(R.layout.dialog_label_email, null);
        
        // Get arguments
        Bundle args = getArguments();
        if (args != null) {
            ArrayList<Integer> mailIdsList = args.getIntegerArrayList(ARG_MAIL_IDS);
            if (mailIdsList != null) {
                mailIds.addAll(mailIdsList);
            }
            isSingleMail = args.getBoolean(ARG_IS_SINGLE_MAIL, true);
            mailSubject = args.getString(ARG_MAIL_SUBJECT, "Email");
        }
        
        initViews(view);
        setupAPI();
        setupClickListeners();
        loadLabels();
        
        builder.setView(view);
        return builder.create();
    }

    private void initViews(View view) {
        labelsContainer = view.findViewById(R.id.labels_container);
        btnCancel = view.findViewById(R.id.btn_cancel);
        btnApply = view.findViewById(R.id.btn_apply);
        titleText = view.findViewById(R.id.tv_title);
        
        // Set title
        titleText.setText("Change Label");
        
        // Change button text
        btnApply.setText("OK");
    }

    private void setupAPI() {
        apiService = ApiClient.getInstance().getApiService();
        authManager = AuthManager.getInstance(requireContext());
    }

    private void setupClickListeners() {
        btnCancel.setOnClickListener(v -> dismiss());
        
        btnApply.setOnClickListener(v -> {
            applyLabelChanges();
        });
    }

    private void loadLabels() {
        Call<List<Label>> call = apiService.getLabels(authManager.getBearerToken());
        call.enqueue(new Callback<List<Label>>() {
            @Override
            public void onResponse(Call<List<Label>> call, Response<List<Label>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    allLabels = response.body();
                    displayLabels();
                } else {
                    showError("Failed to load labels");
                }
            }

            @Override
            public void onFailure(Call<List<Label>> call, Throwable t) {
                showError("Network error: " + t.getMessage());
            }
        });
    }

    private void displayLabels() {
        labelsContainer.removeAllViews();
        
        if (allLabels.isEmpty()) {
            TextView emptyText = new TextView(getContext());
            emptyText.setText("No labels available. Create labels first to organize your emails.");
            emptyText.setTextColor(getContext().getColor(R.color.text_secondary));
            emptyText.setPadding(16, 16, 16, 16);
            labelsContainer.addView(emptyText);
            return;
        }

        for (Label label : allLabels) {
            RadioButton radioButton = new RadioButton(getContext());
            radioButton.setText(label.getName());
            radioButton.setTag(label.getId());
            radioButton.setPadding(16, 12, 16, 12);
            radioButton.setTextColor(getContext().getColor(R.color.text_primary));
            
            labelsContainer.addView(radioButton);
        }
    }

    private void applyLabelChanges() {
        int selectedRadioButtonId = labelsContainer.getCheckedRadioButtonId();
        
        if (selectedRadioButtonId == -1) {
            showError("Please select a label");
            return;
        }

        RadioButton selectedRadioButton = labelsContainer.findViewById(selectedRadioButtonId);
        if (selectedRadioButton == null || selectedRadioButton.getTag() == null) {
            showError("Invalid label selection");
            return;
        }

        Integer selectedLabelId = (Integer) selectedRadioButton.getTag();
        List<Integer> selectedLabelIds = new ArrayList<>();
        selectedLabelIds.add(selectedLabelId);

        // Apply the selected label to all selected emails
        applyLabelsToEmails(selectedLabelIds);
    }

    private void applyLabelsToEmails(List<Integer> labelIds) {
        int totalOperations = mailIds.size() * labelIds.size();
        int[] completedOperations = {0};
        
        for (Integer mailId : mailIds) {
            for (Integer labelId : labelIds) {
                Call<ApiService.ApiResponse> call = apiService.addMailToLabel(authManager.getBearerToken(), labelId, mailId);
                call.enqueue(new Callback<ApiService.ApiResponse>() {
                    @Override
                    public void onResponse(Call<ApiService.ApiResponse> call, Response<ApiService.ApiResponse> response) {
                        completedOperations[0]++;
                        if (completedOperations[0] == totalOperations) {
                            // All operations completed
                            if (listener != null) {
                                listener.onLabelsApplied();
                            }
                            dismiss();
                            showSuccess("Labels applied successfully");
                        }
                    }

                    @Override
                    public void onFailure(Call<ApiService.ApiResponse> call, Throwable t) {
                        completedOperations[0]++;
                        // Continue even if some operations fail
                        if (completedOperations[0] == totalOperations) {
                            if (listener != null) {
                                listener.onLabelsApplied();
                            }
                            dismiss();
                            showError("Some labels may not have been applied");
                        }
                    }
                });
            }
        }
    }

    private void showError(String message) {
        Toast.makeText(getContext(), message, Toast.LENGTH_SHORT).show();
    }

    private void showSuccess(String message) {
        Toast.makeText(getContext(), message, Toast.LENGTH_SHORT).show();
    }
} 