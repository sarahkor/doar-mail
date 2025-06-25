package com.example.myapplication.dialogs;

import android.app.Dialog;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AlertDialog;
import androidx.fragment.app.DialogFragment;

import com.example.myapplication.R;
import com.example.myapplication.models.Label;
import com.google.android.material.button.MaterialButton;

public class DeleteLabelDialog extends DialogFragment {
    
    private static final String ARG_LABEL_ID = "label_id";
    private static final String ARG_LABEL_NAME = "label_name";
    
    private MaterialButton btnCancel, btnDelete;
    private OnLabelDeletedListener listener;
    private int labelId;

    public interface OnLabelDeletedListener {
        void onLabelDeleted(int labelId);
    }

    public static DeleteLabelDialog newInstance(Label label) {
        DeleteLabelDialog dialog = new DeleteLabelDialog();
        Bundle args = new Bundle();
        args.putInt(ARG_LABEL_ID, label.getId());
        args.putString(ARG_LABEL_NAME, label.getName());
        dialog.setArguments(args);
        return dialog;
    }

    public void setOnLabelDeletedListener(OnLabelDeletedListener listener) {
        this.listener = listener;
    }

    @NonNull
    @Override
    public Dialog onCreateDialog(Bundle savedInstanceState) {
        AlertDialog.Builder builder = new AlertDialog.Builder(requireContext());
        LayoutInflater inflater = requireActivity().getLayoutInflater();
        
        View view = inflater.inflate(R.layout.dialog_delete_label, null);
        
        // Get arguments
        Bundle args = getArguments();
        if (args != null) {
            labelId = args.getInt(ARG_LABEL_ID);
            
            initViews(view);
            setupClickListeners();
        }
        
        builder.setView(view);
        return builder.create();
    }

    private void initViews(View view) {
        btnCancel = view.findViewById(R.id.btn_cancel);
        btnDelete = view.findViewById(R.id.btn_delete);
    }

    private void setupClickListeners() {
        btnCancel.setOnClickListener(v -> dismiss());
        
        btnDelete.setOnClickListener(v -> {
            if (listener != null) {
                listener.onLabelDeleted(labelId);
            }
            
            dismiss();
        });
    }
} 