package com.example.myapplication.dialogs;

import android.app.Dialog;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AlertDialog;
import androidx.fragment.app.DialogFragment;

import com.example.myapplication.R;
import com.example.myapplication.models.Label;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.textfield.TextInputEditText;

public class EditLabelDialog extends DialogFragment {
    
    private static final String ARG_LABEL_ID = "label_id";
    private static final String ARG_LABEL_NAME = "label_name";
    
    private TextInputEditText etLabelName;
    private MaterialButton btnCancel, btnSave;
    private OnLabelEditedListener listener;
    private int labelId;

    public interface OnLabelEditedListener {
        void onLabelEdited(int labelId, String newName);
    }

    public static EditLabelDialog newInstance(Label label) {
        EditLabelDialog dialog = new EditLabelDialog();
        Bundle args = new Bundle();
        args.putInt(ARG_LABEL_ID, label.getId());
        args.putString(ARG_LABEL_NAME, label.getName());
        dialog.setArguments(args);
        return dialog;
    }

    public void setOnLabelEditedListener(OnLabelEditedListener listener) {
        this.listener = listener;
    }

    @NonNull
    @Override
    public Dialog onCreateDialog(Bundle savedInstanceState) {
        AlertDialog.Builder builder = new AlertDialog.Builder(requireContext());
        LayoutInflater inflater = requireActivity().getLayoutInflater();
        
        View view = inflater.inflate(R.layout.dialog_edit_label, null);
        
        // Get arguments
        Bundle args = getArguments();
        if (args != null) {
            labelId = args.getInt(ARG_LABEL_ID);
            String labelName = args.getString(ARG_LABEL_NAME);
            
            initViews(view);
            etLabelName.setText(labelName);
            setupClickListeners();
        }
        
        builder.setView(view);
        return builder.create();
    }

    private void initViews(View view) {
        etLabelName = view.findViewById(R.id.et_label_name);
        btnCancel = view.findViewById(R.id.btn_cancel);
        btnSave = view.findViewById(R.id.btn_save);
    }

    private void setupClickListeners() {
        btnCancel.setOnClickListener(v -> dismiss());
        
        btnSave.setOnClickListener(v -> {
            String newName = etLabelName.getText().toString().trim();
            
            if (TextUtils.isEmpty(newName)) {
                Toast.makeText(getContext(), "Please enter a label name", Toast.LENGTH_SHORT).show();
                return;
            }
            
            if (listener != null) {
                listener.onLabelEdited(labelId, newName);
            }
            
            dismiss();
        });
    }
} 