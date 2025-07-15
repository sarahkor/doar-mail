package com.example.myapplication.dialogs;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.example.myapplication.R;
import com.example.myapplication.models.Label;
import com.google.android.material.bottomsheet.BottomSheetDialogFragment;

public class LabelOptionsBottomSheet extends BottomSheetDialogFragment {
    
    private static final String ARG_LABEL_ID = "label_id";
    private static final String ARG_LABEL_NAME = "label_name";
    private static final String ARG_LABEL_COLOR = "label_color";
    
    private LinearLayout optionColor, optionEdit, optionDelete;
    private OnOptionSelectedListener listener;
    private Label label;

    public interface OnOptionSelectedListener {
        void onColorOptionSelected(Label label);
        void onEditOptionSelected(Label label);
        void onDeleteOptionSelected(Label label);
    }

    public static LabelOptionsBottomSheet newInstance(Label label) {
        LabelOptionsBottomSheet bottomSheet = new LabelOptionsBottomSheet();
        Bundle args = new Bundle();
        args.putInt(ARG_LABEL_ID, label.getId+());
        args.putString(ARG_LABEL_NAME, label.getName());
        args.putString(ARG_LABEL_COLOR, label.getColor());
        bottomSheet.setArguments(args);
        return bottomSheet;
    }

    public void setOnOptionSelectedListener(OnOptionSelectedListener listener) {
        this.listener = listener;
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.bottom_sheet_label_options, container, false);
        
        // Get arguments and create label object
        Bundle args = getArguments();
        if (args != null) {
            label = new Label();
            label.setId(args.getInt(ARG_LABEL_ID));
            label.setName(args.getString(ARG_LABEL_NAME));
            label.setColor(args.getString(ARG_LABEL_COLOR));
            
            initViews(view);
            setupClickListeners();
        }
        
        return view;
    }

    private void initViews(View view) {
        optionColor = view.findViewById(R.id.option_color);
        optionEdit = view.findViewById(R.id.option_edit);
        optionDelete = view.findViewById(R.id.option_delete);
    }

    private void setupClickListeners() {
        optionColor.setOnClickListener(v -> {
            if (listener != null) {
                listener.onColorOptionSelected(label);
            }
            dismiss();
        });

        optionEdit.setOnClickListener(v -> {
            if (listener != null) {
                listener.onEditOptionSelected(label);
            }
            dismiss();
        });

        optionDelete.setOnClickListener(v -> {
            if (listener != null) {
                listener.onDeleteOptionSelected(label);
            }
            dismiss();
        });
    }
} 