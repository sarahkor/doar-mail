package com.example.myapplication.adapters;

import android.content.Context;
import android.graphics.Color;
import android.graphics.PorterDuff;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.myapplication.R;
import com.example.myapplication.models.Label;

import java.util.List;
import android.view.View;

public class LabelAdapter extends RecyclerView.Adapter<LabelAdapter.LabelViewHolder> {
    
    private List<Label> labels;
    private Context context;
    private OnLabelClickListener clickListener;
    private OnLabelEditClickListener editClickListener;

    public interface OnLabelClickListener {
        void onLabelClick(Label label, View itemView);
    }

    public interface OnLabelEditClickListener {
        void onLabelEditClick(Label label);
    }

    public LabelAdapter(Context context, List<Label> labels) {
        this.context = context;
        this.labels = labels;
    }

    public void setOnLabelClickListener(OnLabelClickListener listener) {
        this.clickListener = listener;
    }

    public void setOnLabelEditClickListener(OnLabelEditClickListener listener) {
        this.editClickListener = listener;
    }

    @NonNull
    @Override
    public LabelViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.item_label, parent, false);
        return new LabelViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull LabelViewHolder holder, int position) {
        Label label = labels.get(position);
        holder.bind(label);
    }

    @Override
    public int getItemCount() {
        return labels.size();
    }

    public void updateLabels(List<Label> newLabels) {
        this.labels = newLabels;
        notifyDataSetChanged();
    }

    class LabelViewHolder extends RecyclerView.ViewHolder {
        private ImageView labelIcon;
        private TextView labelName;
        private ImageView editButton;

        public LabelViewHolder(@NonNull View itemView) {
            super(itemView);
            labelIcon = itemView.findViewById(R.id.iv_label_icon);
            labelName = itemView.findViewById(R.id.tv_label_name);
            editButton = itemView.findViewById(R.id.btn_edit_label);
        }

        public void bind(Label label) {
            labelName.setText(label.getName());
            
            // Set label icon color
            try {
                int color = Color.parseColor(label.getColor());
                labelIcon.setColorFilter(color, PorterDuff.Mode.SRC_IN);
            } catch (Exception e) {
                // Default color if parsing fails
                labelIcon.setColorFilter(Color.parseColor("#666666"), PorterDuff.Mode.SRC_IN);
            }

            // Set click listeners
            itemView.setOnClickListener(v -> {
                if (clickListener != null) {
                    clickListener.onLabelClick(label, v);
                }
            });

            editButton.setOnClickListener(v -> {
                if (editClickListener != null) {
                    editClickListener.onLabelEditClick(label);
                }
            });
        }
    }
} 