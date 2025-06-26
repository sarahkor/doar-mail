package com.example.myapplication.adapters;

import android.content.Context;
import android.graphics.Color;
import android.graphics.drawable.GradientDrawable;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.myapplication.R;

import java.util.List;

public class ColorAdapter extends RecyclerView.Adapter<ColorAdapter.ColorViewHolder> {
    
    private List<String> colors;
    private Context context;
    private OnColorSelectedListener listener;
    private String selectedColor;

    public interface OnColorSelectedListener {
        void onColorSelected(String color);
    }

    public ColorAdapter(Context context, List<String> colors) {
        this.context = context;
        this.colors = colors;
    }

    public void setOnColorSelectedListener(OnColorSelectedListener listener) {
        this.listener = listener;
    }

    public void setSelectedColor(String color) {
        this.selectedColor = color;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ColorViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.item_color, parent, false);
        return new ColorViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ColorViewHolder holder, int position) {
        String color = colors.get(position);
        holder.bind(color);
    }

    @Override
    public int getItemCount() {
        return colors.size();
    }

    class ColorViewHolder extends RecyclerView.ViewHolder {
        private View colorCircle;
        private ImageView selectedIndicator;

        public ColorViewHolder(@NonNull View itemView) {
            super(itemView);
            colorCircle = itemView.findViewById(R.id.color_circle);
            selectedIndicator = itemView.findViewById(R.id.iv_selected);
        }

        public void bind(String color) {
            // Set the color of the circle
            GradientDrawable drawable = (GradientDrawable) colorCircle.getBackground();
            int colorInt = parseColorSafe(color);
            drawable.setColor(colorInt);

            // Show/hide selected indicator
            boolean isSelected = color.equals(selectedColor);
            selectedIndicator.setVisibility(isSelected ? View.VISIBLE : View.GONE);

            // Set click listener
            itemView.setOnClickListener(v -> {
                if (listener != null) {
                    listener.onColorSelected(color);
                }
            });
        }
    }

    // Predefined colors for labels (matching web server exactly)
    public static List<String> getDefaultColors() {
        return java.util.Arrays.asList(
            "#f28b82", "#fbbc04", "#fff475", "#ccff90",
            "#a7ffeb", "#cbf0f8", "#aecbfa", "#d7aefb",
            "#fdcfe8", "#e6c9a8", "#e8eaed"
        );
    }
    
    // Helper method to parse hex colors
    private int parseColorSafe(String color) {
        try {
            return Color.parseColor(color);
        } catch (Exception e) {
            return Color.parseColor("#e8eaed"); // Default to light gray from allowed colors
        }
    }
} 