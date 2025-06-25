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

import java.util.List;

public class MailAdapter extends RecyclerView.Adapter<MailAdapter.MailViewHolder> {

    private List<Mail> mails;
    private OnMailClickListener onMailClickListener;
    private OnStarClickListener onStarClickListener;

    public interface OnMailClickListener {
        void onMailClick(Mail mail);
    }

    public interface OnStarClickListener {
        void onStarClick(Mail mail);
    }

    public MailAdapter(List<Mail> mails, OnMailClickListener onMailClickListener, OnStarClickListener onStarClickListener) {
        this.mails = mails;
        this.onMailClickListener = onMailClickListener;
        this.onStarClickListener = onStarClickListener;
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

        public MailViewHolder(@NonNull View itemView) {
            super(itemView);
            senderAvatar = itemView.findViewById(R.id.iv_sender_avatar);
            senderName = itemView.findViewById(R.id.tv_sender_name);
            time = itemView.findViewById(R.id.tv_time);
            subject = itemView.findViewById(R.id.tv_subject);
            bodyPreview = itemView.findViewById(R.id.tv_body_preview);
            starButton = itemView.findViewById(R.id.btn_star);

            itemView.setOnClickListener(v -> {
                int position = getAdapterPosition();
                if (position != RecyclerView.NO_POSITION && onMailClickListener != null) {
                    onMailClickListener.onMailClick(mails.get(position));
                }
            });

            starButton.setOnClickListener(v -> {
                int position = getAdapterPosition();
                if (position != RecyclerView.NO_POSITION && onStarClickListener != null) {
                    onStarClickListener.onStarClick(mails.get(position));
                }
            });
        }

        public void bind(Mail mail) {
            // Set sender name - use fromName if available, otherwise use from email
            String displayName = mail.getDisplayFrom();
            senderName.setText(displayName);

            // Set time
            if (mail.getTime() != null) {
                time.setText(mail.getTime());
            } else {
                time.setText("");
            }

            // Set subject
            subject.setText(mail.getDisplaySubject());

            // Set body preview
            if (mail.getBodyPreview() != null && !mail.getBodyPreview().trim().isEmpty()) {
                bodyPreview.setText(mail.getBodyPreview());
                bodyPreview.setVisibility(View.VISIBLE);
            } else {
                bodyPreview.setVisibility(View.GONE);
            }

            // Set star icon
            starButton.setImageResource(mail.isStarred() ? R.drawable.ic_star_filled : R.drawable.ic_star_outline);

            // Load sender avatar - generate from name/email
            loadSenderAvatar(mail, senderAvatar);
        }

        private void loadSenderAvatar(Mail mail, ImageView avatarView) {
            Context context = avatarView.getContext();
            
            // Generate avatar URL based on sender name/email
            String name = mail.getFromName();
            if (name == null || name.trim().isEmpty()) {
                name = mail.getFrom();
                if (name != null && name.contains("@")) {
                    name = name.substring(0, name.indexOf("@"));
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