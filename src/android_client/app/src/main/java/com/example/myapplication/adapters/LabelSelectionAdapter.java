
package com.example.myapplication.adapters;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.CheckBox;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.example.myapplication.R;
import com.example.myapplication.models.Label;
import java.util.List;
import java.util.Set;

public class LabelSelectionAdapter
        extends RecyclerView.Adapter<LabelSelectionAdapter.VH> {

    private final Context ctx;
    private final List<Label> labels;
    private final Set<String> selectedLabelIds;

    public LabelSelectionAdapter(Context ctx,
                                 List<Label> labels,
                                 Set<String> initialSelectedIds) {
        this.ctx = ctx;
        this.labels = labels;
        this.selectedLabelIds = initialSelectedIds;
    }

    @NonNull
    @Override
    public VH onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View v = LayoutInflater.from(ctx)
                .inflate(R.layout.item_label_selectable, parent, false);
        return new VH(v);
    }

    @Override
    public void onBindViewHolder(@NonNull VH h, int pos) {
        Label L = labels.get(pos);
        h.check.setText(L.getName());
        h.check.setChecked(selectedLabelIds.contains(L.getId()));
        h.check.setOnClickListener(view -> {
            if (h.check.isChecked()) selectedLabelIds.add(L.getId());
            else selectedLabelIds.remove(L.getId());
        });
    }

    @Override
    public int getItemCount() { return labels.size(); }

    static class VH extends RecyclerView.ViewHolder {
        CheckBox check;
        VH(View v) {
            super(v);
            check = v.findViewById(R.id.cb_label);
        }
    }
}
