package com.example.myapplication.dialogs;

import android.app.Dialog;
import android.content.Context;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AlertDialog;
import androidx.fragment.app.DialogFragment;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.myapplication.R;
import com.example.myapplication.adapters.ColorAdapter;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.textfield.TextInputEditText;

public class NewLabelDialog extends DialogFragment {
    
    private TextInputEditText etLabelName;
    private RecyclerView rvColors;
    private MaterialButton btnCancel, btnCreate;
    private ColorAdapter colorAdapter;
    private String selectedColor = "#e8eaed"; // Default color from allowed colors
    private OnLabelCreatedListener listener;

    public interface OnLabelCreatedListener {
        void onLabelCreated(String name, String color);
    }

    public static NewLabelDialog newInstance() {
        return new NewLabelDialog();
    }

    public void setOnLabelCreatedListener(OnLabelCreatedListener listener) {
        this.listener = listener;
    }

    @NonNull
    @Override
    public Dialog onCreateDialog(Bundle savedInstanceState) {
        AlertDialog.Builder builder = new AlertDialog.Builder(requireContext());
        LayoutInflater inflater = requireActivity().getLayoutInflater();
        
        View view = inflater.inflate(R.layout.dialog_new_label, null);
        
        initViews(view);
        setupColorPicker();
        setupClickListeners();
        
        builder.setView(view);
        return builder.create();
    }

    private void initViews(View view) {
        etLabelName = view.findViewById(R.id.et_label_name);
        rvColors = view.findViewById(R.id.rv_colors);
        btnCancel = view.findViewById(R.id.btn_cancel);
        btnCreate = view.findViewById(R.id.btn_create);
    }

    private void setupColorPicker() {
        colorAdapter = new ColorAdapter(getContext(), ColorAdapter.getDefaultColors());
        colorAdapter.setSelectedColor(selectedColor);
        
        rvColors.setLayoutManager(new GridLayoutManager(getContext(), 6));
        rvColors.setAdapter(colorAdapter);
        
        colorAdapter.setOnColorSelectedListener(color -> {
            selectedColor = color;
            colorAdapter.setSelectedColor(color);
        });
    }

    private void setupClickListeners() {
        btnCancel.setOnClickListener(v -> dismiss());
        
        btnCreate.setOnClickListener(v -> {
            String labelName = etLabelName.getText().toString().trim();
            
            if (TextUtils.isEmpty(labelName)) {
                Toast.makeText(getContext(), "Please enter a label name", Toast.LENGTH_SHORT).show();
                return;
            }
            
            if (listener != null) {
                listener.onLabelCreated(labelName, selectedColor);
            }
            
            dismiss();
        });
    }
} 