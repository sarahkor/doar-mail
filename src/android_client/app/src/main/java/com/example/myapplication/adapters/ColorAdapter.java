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
            try {
                int colorInt = Color.parseColor(color);
                drawable.setColor(colorInt);
            } catch (Exception e) {
                drawable.setColor(Color.parseColor("#666666"));
            }

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

    // Predefined colors for labels (matching React project)
    public static List<String> getDefaultColors() {
        return java.util.Arrays.asList(
            "#FF4444", // Red
            "#FF8800", // Orange  
            "#FFBB33", // Yellow
            "#00C851", // Green
            "#33B5E5", // Blue
            "#AA66CC", // Purple
            "#FF6699", // Pink
            "#996633", // Brown
            "#666666", // Gray
            "#000000"  // Black
        );
    }
} 