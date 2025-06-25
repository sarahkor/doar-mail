package com.example.myapplication.dialogs;

import android.app.Dialog;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AlertDialog;
import androidx.fragment.app.DialogFragment;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.myapplication.R;
import com.example.myapplication.adapters.ColorAdapter;
import com.example.myapplication.models.Label;
import com.google.android.material.button.MaterialButton;

public class ColorPickerDialog extends DialogFragment {
    
    private static final String ARG_LABEL_ID = "label_id";
    private static final String ARG_CURRENT_COLOR = "current_color";
    
    private RecyclerView rvColors;
    private MaterialButton btnCancel;
    private ColorAdapter colorAdapter;
    private OnColorSelectedListener listener;
    private int labelId;
    private String selectedColor;

    public interface OnColorSelectedListener {
        void onColorSelected(int labelId, String color);
    }

    public static ColorPickerDialog newInstance(Label label) {
        ColorPickerDialog dialog = new ColorPickerDialog();
        Bundle args = new Bundle();
        args.putInt(ARG_LABEL_ID, label.getId());
        args.putString(ARG_CURRENT_COLOR, label.getColor());
        dialog.setArguments(args);
        return dialog;
    }

    public void setOnColorSelectedListener(OnColorSelectedListener listener) {
        this.listener = listener;
    }

    @NonNull
    @Override
    public Dialog onCreateDialog(Bundle savedInstanceState) {
        AlertDialog.Builder builder = new AlertDialog.Builder(requireContext());
        LayoutInflater inflater = requireActivity().getLayoutInflater();
        
        View view = inflater.inflate(R.layout.dialog_color_picker, null);
        
        // Get arguments
        Bundle args = getArguments();
        if (args != null) {
            labelId = args.getInt(ARG_LABEL_ID);
            selectedColor = args.getString(ARG_CURRENT_COLOR, "#666666");
            
            initViews(view);
            setupColorPicker();
            setupClickListeners();
        }
        
        builder.setView(view);
        return builder.create();
    }

    private void initViews(View view) {
        rvColors = view.findViewById(R.id.rv_colors);
        btnCancel = view.findViewById(R.id.btn_cancel);
    }

    private void setupColorPicker() {
        colorAdapter = new ColorAdapter(getContext(), ColorAdapter.getDefaultColors());
        colorAdapter.setSelectedColor(selectedColor);
        
        rvColors.setLayoutManager(new GridLayoutManager(getContext(), 6));
        rvColors.setAdapter(colorAdapter);
        
        colorAdapter.setOnColorSelectedListener(color -> {
            selectedColor = color;
            colorAdapter.setSelectedColor(color);
            
            // Immediately apply the color change
            if (listener != null) {
                listener.onColorSelected(labelId, color);
            }
            
            dismiss();
        });
    }

    private void setupClickListeners() {
        btnCancel.setOnClickListener(v -> dismiss());
    }
} 