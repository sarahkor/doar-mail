package com.example.myapplication;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;
import com.example.myapplication.api.ApiClient;
import com.example.myapplication.models.Mail;
import com.example.myapplication.models.Label;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class MailAdapter extends RecyclerView.Adapter<MailAdapter.MailViewHolder> {

    private List<Mail> mails;
    private OnMailClickListener onMailClickListener;
    private OnStarClickListener onStarClickListener;

    private OnMailLongClickListener onMailLongClickListener;
    private OnSelectionChangedListener onSelectionChangedListener;
    private Set<Integer> selectedMails = new HashSet<>();
    private boolean isSelectionMode = false;
    private MailFolder currentFolder; // Add folder context
    private OnLabelMailClickListener onLabelMailClickListener;
    private List<Label> allLabels;

    public interface OnMailClickListener {
        void onMailClick(Mail mail);
    }

    public interface OnStarClickListener {
        void onStarClick(Mail mail);
    }



    public interface OnMailLongClickListener {
        void onMailLongClick(Mail mail);
    }

    public interface OnSelectionChangedListener {
        void onSelectionChanged();
    }

    public interface OnLabelMailClickListener {
        void onLabelMailClick(Mail mail);
    }

    public MailAdapter(List<Mail> mails, OnMailClickListener onMailClickListener, OnStarClickListener onStarClickListener) {
        this.mails = mails;
        this.onMailClickListener = onMailClickListener;
        this.onStarClickListener = onStarClickListener;
        this.currentFolder = MailFolder.INBOX; // Default folder
    }
    
    // Add method to set the current folder
    public void setCurrentFolder(MailFolder folder) {
        this.currentFolder = folder;
        notifyDataSetChanged(); // Refresh the display
    }

    public void setAllLabels(List<Label> labels) {
        this.allLabels = labels;
    }


    public void setOnMailLongClickListener(OnMailLongClickListener listener) {
        this.onMailLongClickListener = listener;
    }

    public void setOnSelectionChangedListener(OnSelectionChangedListener listener) {
        this.onSelectionChangedListener = listener;
    }

    public void setSelectionMode(boolean isSelectionMode) {
        this.isSelectionMode = isSelectionMode;
        if (!isSelectionMode) {
            selectedMails.clear();
        }
        notifyDataSetChanged();
    }

    public boolean isSelectionMode() {
        return isSelectionMode;
    }

    public void toggleSelection(int mailId) {
        if (selectedMails.contains(mailId)) {
            selectedMails.remove(mailId);
        } else {
            selectedMails.add(mailId);
        }
        notifyDataSetChanged();
        if (onSelectionChangedListener != null) {
            onSelectionChangedListener.onSelectionChanged();
        }
    }

    public Set<Integer> getSelectedMails() {
        return new HashSet<>(selectedMails);
    }

    public int getSelectedCount() {
        return selectedMails.size();
    }

    public void clearSelection() {
        selectedMails.clear();
        notifyDataSetChanged();
    }

    public void setOnLabelMailClickListener(OnLabelMailClickListener listener) {
        this.onLabelMailClickListener = listener;
    }

    @NonNull
    @Override
    public MailViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_mail, parent, false);
        return new MailViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull MailViewHolder holder, int position) {
        Mail mail = mails.get(position);
        holder.bind(mail);
    }

    @Override
    public int getItemCount() {
        return mails.size();
    }

    class MailViewHolder extends RecyclerView.ViewHolder {
        private ImageView senderAvatar;
        private TextView senderName;
        private TextView time;
        private TextView subject;
        private TextView bodyPreview;
        private ImageButton starButton;
        private ImageButton labelMailButton;
        private TextView labelBadge;

        private View unreadIndicator;

        public MailViewHolder(@NonNull View itemView) {
            super(itemView);
            senderAvatar = itemView.findViewById(R.id.iv_sender_avatar);
            senderName = itemView.findViewById(R.id.tv_sender_name);
            time = itemView.findViewById(R.id.tv_time);
            subject = itemView.findViewById(R.id.tv_subject);
            bodyPreview = itemView.findViewById(R.id.tv_body_preview);
            starButton = itemView.findViewById(R.id.btn_star);
            labelMailButton = itemView.findViewById(R.id.btn_label_mail);
            labelBadge = itemView.findViewById(R.id.tv_label_badge);

            unreadIndicator = itemView.findViewById(R.id.unread_indicator);

            itemView.setOnClickListener(v -> {
                int position = getAdapterPosition();
                if (position != RecyclerView.NO_POSITION) {
                    Mail mail = mails.get(position);
                    if (isSelectionMode) {
                        toggleSelection(mail.getId());
                    } else if (onMailClickListener != null) {
                        onMailClickListener.onMailClick(mail);
                    }
                }
            });

            itemView.setOnLongClickListener(v -> {
                int position = getAdapterPosition();
                if (position != RecyclerView.NO_POSITION && onMailLongClickListener != null) {
                    Mail mail = mails.get(position);
                    onMailLongClickListener.onMailLongClick(mail);
                    return true;
                }
                return false;
            });

            starButton.setOnClickListener(v -> {
                int position = getAdapterPosition();
                if (position != RecyclerView.NO_POSITION && onStarClickListener != null) {
                    onStarClickListener.onStarClick(mails.get(position));
                }
            });

            labelMailButton.setOnClickListener(v -> {
                int position = getAdapterPosition();
                if (position != RecyclerView.NO_POSITION && onLabelMailClickListener != null) {
                    onLabelMailClickListener.onLabelMailClick(mails.get(position));
                }
            });


        }

        public void bind(Mail mail) {
            // Determine what name to display based on folder and mail status
            String displayName;
            if ("draft".equals(mail.getStatus())) {
                // For drafts, show just the recipient name (no prefix)
                displayName = mail.getDisplayTo();
            } else if (currentFolder == MailFolder.SENT) {
                // In Sent folder, show recipient name with "To:" prefix
                displayName = "To: " + mail.getDisplayTo();
            } else {
                // In other folders, show sender name
                displayName = mail.getDisplayFrom();
            }
            senderName.setText(displayName);

            // Set time
            if (mail.getTime() != null) {
                time.setText(mail.getTime());
            } else {
                time.setText("");
            }

            // Set subject - show "Draft" in red if it's a draft
            if ("draft".equals(mail.getStatus())) {
                subject.setText("Draft");
                subject.setTextColor(itemView.getContext().getColor(R.color.draft_indicator));
            } else {
                subject.setText(mail.getDisplaySubject());
                // Subject color will be set later based on read/unread status
            }

            // Set body preview
            if (mail.getBodyPreview() != null && !mail.getBodyPreview().trim().isEmpty()) {
                bodyPreview.setText(mail.getBodyPreview());
                bodyPreview.setVisibility(View.VISIBLE);
            } else {
                bodyPreview.setVisibility(View.GONE);
            }

            // Set star icon
            starButton.setImageResource(mail.isStarred() ? R.drawable.ic_star_filled : R.drawable.ic_star_outline);

            // Label badge logic
            if (mail.getLabelIds() != null && !mail.getLabelIds().isEmpty() && allLabels != null) {
                String labelId = mail.getLabelIds().get(0); // Show first label only
                Label found = null;
                for (Label l : allLabels) {
                    if (l.getId().equals(labelId)) {
                        found = l;
                        break;
                    }
                }
                if (found != null) {
                    labelBadge.setText(found.getName());
                    try {
                        int color = android.graphics.Color.parseColor(found.getColor());
                        android.graphics.drawable.GradientDrawable bg = (android.graphics.drawable.GradientDrawable) labelBadge.getBackground();
                        bg.setColor(color);
                    } catch (Exception e) {
                        // fallback to default
                        android.graphics.drawable.GradientDrawable bg = (android.graphics.drawable.GradientDrawable) labelBadge.getBackground();
                        bg.setColor(itemView.getContext().getColor(R.color.primary));
                    }
                    labelBadge.setVisibility(View.VISIBLE);
                } else {
                    labelBadge.setVisibility(View.GONE);
                }
            } else {
                labelBadge.setVisibility(View.GONE);
            }

            // Handle selection mode visual state
            boolean isSelected = selectedMails.contains(mail.getId());
            boolean isUnread = !mail.isRead();
            boolean isDraft = "draft".equals(mail.getStatus());
            
            if (isSelectionMode) {
                itemView.setAlpha(isSelected ? 0.7f : 1.0f);
                itemView.setBackgroundColor(isSelected ? 
                    itemView.getContext().getColor(R.color.selected_mail_background) : 
                    itemView.getContext().getColor(android.R.color.transparent));
            } else {
                itemView.setAlpha(1.0f);
                // Apply unread styling when not in selection mode and not a draft
                if (isUnread && !isDraft) {
                    itemView.setBackgroundColor(itemView.getContext().getColor(R.color.unread_mail_background));
                } else {
                    itemView.setBackgroundColor(itemView.getContext().getColor(android.R.color.transparent));
                }
            }
            
            // Apply text styling based on draft/unread status
            if (isDraft) {
                // Drafts: normal styling except subject is already set to red "Draft"
                unreadIndicator.setVisibility(View.GONE);
                senderName.setTextColor(itemView.getContext().getColor(R.color.mail_sender));
                senderName.setTypeface(senderName.getTypeface(), android.graphics.Typeface.NORMAL);
                // subject color is already set to red above
                subject.setTypeface(subject.getTypeface(), android.graphics.Typeface.NORMAL);
                time.setTextColor(itemView.getContext().getColor(R.color.mail_time));
                time.setTypeface(time.getTypeface(), android.graphics.Typeface.NORMAL);
            } else {
                // Non-draft emails: apply unread styling if unread and not in selection mode
                if (isUnread && !isSelectionMode) {
                    senderName.setTextColor(itemView.getContext().getColor(R.color.unread_mail_sender));
                    senderName.setTypeface(senderName.getTypeface(), android.graphics.Typeface.BOLD);
                    subject.setTextColor(itemView.getContext().getColor(R.color.unread_mail_subject));
                    subject.setTypeface(subject.getTypeface(), android.graphics.Typeface.BOLD);
                    time.setTextColor(itemView.getContext().getColor(R.color.unread_mail_time));
                    time.setTypeface(time.getTypeface(), android.graphics.Typeface.BOLD);
                    unreadIndicator.setVisibility(View.VISIBLE);
                } else {
                    senderName.setTextColor(itemView.getContext().getColor(R.color.mail_sender));
                    senderName.setTypeface(senderName.getTypeface(), android.graphics.Typeface.NORMAL);
                    subject.setTextColor(itemView.getContext().getColor(R.color.mail_subject));
                    subject.setTypeface(subject.getTypeface(), android.graphics.Typeface.NORMAL);
                    time.setTextColor(itemView.getContext().getColor(R.color.mail_time));
                    time.setTypeface(time.getTypeface(), android.graphics.Typeface.NORMAL);
                    unreadIndicator.setVisibility(View.GONE);
                }
            }

            // Load avatar based on folder context
            loadAvatar(mail, senderAvatar);
        }



        private void loadAvatar(Mail mail, ImageView avatarView) {
            Context context = avatarView.getContext();
            
            // Generate avatar URL based on the person we want to show
            String name;
            if (currentFolder == MailFolder.SENT) {
                // In Sent folder, show recipient's avatar
                name = mail.getToName();
                if (name == null || name.trim().isEmpty()) {
                    name = mail.getTo();
                    if (name != null && name.contains("@")) {
                        name = name.substring(0, name.indexOf("@"));
                    }
                }
            } else {
                // In other folders, show sender's avatar
                name = mail.getFromName();
                if (name == null || name.trim().isEmpty()) {
                    name = mail.getFrom();
                    if (name != null && name.contains("@")) {
                        name = name.substring(0, name.indexOf("@"));
                    }
                }
            }
            
            if (name == null || name.trim().isEmpty()) {
                name = "User";
            }

            // Create avatar URL using UI Avatars service
            String avatarUrl = "https://ui-avatars.com/api/?name=" + 
                               name.replace(" ", "+") + 
                               "&background=f69fd5&color=fff&size=80";

            Glide.with(context)
                .load(avatarUrl)
                .placeholder(R.drawable.ic_account_circle)
                .error(R.drawable.ic_account_circle)
                .into(avatarView);
        }
    }
} 