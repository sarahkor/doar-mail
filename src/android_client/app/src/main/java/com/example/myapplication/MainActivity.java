package com.example.myapplication;

import android.app.Dialog;
import android.graphics.drawable.ColorDrawable;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowManager;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.drawerlayout.widget.DrawerLayout;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;
import com.example.myapplication.api.ApiClient;
import com.example.myapplication.api.ApiService;
import com.example.myapplication.databinding.ActivityMainBinding;
import com.example.myapplication.models.Mail;
import com.example.myapplication.models.User;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class MainActivity extends AppCompatActivity {

    private ActivityMainBinding binding;
    private DrawerLayout drawerLayout;
    private RecyclerView recyclerView;
    private MailAdapter mailAdapter;
    private ProgressBar progressLoading;
    private LinearLayout emptyStateLayout;
    
    private ApiService apiService;
    private String authToken = "Bearer test-token"; // TODO: Implement proper authentication
    private User currentUser;
    private List<Mail> allMails = new ArrayList<>();
    private List<Mail> filteredMails = new ArrayList<>();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityMainBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        initializeViews();
        setupAPI();
        setupUI();
        loadUserProfile();
        loadMails();
    }

    private void initializeViews() {
        drawerLayout = binding.drawerLayout;
        recyclerView = binding.rvMails;
        progressLoading = binding.progressLoading;
        emptyStateLayout = binding.layoutEmptyState;
    }

    private void setupAPI() {
        apiService = ApiClient.getInstance().getApiService();
    }

    private void setupUI() {
        setupRecyclerView();
        setupSearchBar();
        setupNavigationButtons();
    }

    private void setupRecyclerView() {
        mailAdapter = new MailAdapter(filteredMails, this::onMailClick, this::onStarClick);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        recyclerView.setAdapter(mailAdapter);
    }

    private void setupSearchBar() {
        binding.etSearch.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                filterMails(s.toString());
                binding.btnClearSearch.setVisibility(s.length() > 0 ? View.VISIBLE : View.GONE);
            }

            @Override
            public void afterTextChanged(Editable s) {}
        });

        binding.btnClearSearch.setOnClickListener(v -> {
            binding.etSearch.setText("");
            filterMails("");
        });
    }

    private void setupNavigationButtons() {
        binding.btnMenu.setOnClickListener(v -> {
            if (drawerLayout.isDrawerOpen(binding.navView)) {
                drawerLayout.closeDrawer(binding.navView);
            } else {
                drawerLayout.openDrawer(binding.navView);
            }
        });

        binding.btnProfile.setOnClickListener(v -> showProfileMenu());
    }

    private void filterMails(String query) {
        filteredMails.clear();
        
        if (query.isEmpty()) {
            filteredMails.addAll(allMails);
        } else {
            String searchQuery = query.toLowerCase().trim();
            for (Mail mail : allMails) {
                if (mailMatchesQuery(mail, searchQuery)) {
                    filteredMails.add(mail);
                }
            }
        }
        
        mailAdapter.notifyDataSetChanged();
        updateEmptyState();
    }

    private boolean mailMatchesQuery(Mail mail, String query) {
        return (mail.getFrom() != null && mail.getFrom().toLowerCase().contains(query)) ||
               (mail.getFromName() != null && mail.getFromName().toLowerCase().contains(query)) ||
               (mail.getSubject() != null && mail.getSubject().toLowerCase().contains(query)) ||
               (mail.getBodyPreview() != null && mail.getBodyPreview().toLowerCase().contains(query)) ||
               (mail.getTo() != null && mail.getTo().toLowerCase().contains(query));
    }

    private void loadUserProfile() {
        showLoading(true);
        
        apiService.getCurrentUser(authToken).enqueue(new Callback<ApiService.UserResponse>() {
            @Override
            public void onResponse(Call<ApiService.UserResponse> call, Response<ApiService.UserResponse> response) {
                showLoading(false);
                if (response.isSuccessful() && response.body() != null) {
                    currentUser = response.body().getUser();
                } else {
                    showError("Failed to load user profile");
                    // Set default user for demo
                    currentUser = new User();
                    currentUser.setFirstName("Demo");
                    currentUser.setLastName("User");
                    currentUser.setUsername("demo@doar.com");
                }
            }

            @Override
            public void onFailure(Call<ApiService.UserResponse> call, Throwable t) {
                showLoading(false);
                showError("Network error: " + t.getMessage());
                // Set default user for demo
                currentUser = new User();
                currentUser.setFirstName("Demo");
                currentUser.setLastName("User");
                currentUser.setUsername("demo@doar.com");
            }
        });
    }

    private void loadMails() {
        showLoading(true);
        
        apiService.getAllMails(authToken).enqueue(new Callback<List<Mail>>() {
            @Override
            public void onResponse(Call<List<Mail>> call, Response<List<Mail>> response) {
                showLoading(false);
                if (response.isSuccessful() && response.body() != null) {
                    allMails.clear();
                    allMails.addAll(response.body());
                    filteredMails.clear();
                    filteredMails.addAll(allMails);
                    mailAdapter.notifyDataSetChanged();
                    updateEmptyState();
                } else {
                    showError("Failed to load mails");
                }
            }

            @Override
            public void onFailure(Call<List<Mail>> call, Throwable t) {
                showLoading(false);
                showError("Network error: " + t.getMessage());
                // Load demo data for testing
                loadDemoMails();
            }
        });
    }

    private void loadDemoMails() {
        // Demo data for testing UI
        allMails.clear();
        Mail mail1 = new Mail();
        mail1.setId(1);
        mail1.setFrom("john@doar.com");
        mail1.setFromName("John Doe");
        mail1.setSubject("Meeting Tomorrow");
        mail1.setBodyPreview("Don't forget about our meeting tomorrow at 10 AM...");
        mail1.setTime("10:30");
        mail1.setStarred(false);
        allMails.add(mail1);

        Mail mail2 = new Mail();
        mail2.setId(2);
        mail2.setFrom("jane@doar.com");
        mail2.setFromName("Jane Smith");
        mail2.setSubject("Project Update");
        mail2.setBodyPreview("The project is progressing well. Here's the latest update...");
        mail2.setTime("09:15");
        mail2.setStarred(true);
        allMails.add(mail2);

        filteredMails.clear();
        filteredMails.addAll(allMails);
        mailAdapter.notifyDataSetChanged();
        updateEmptyState();
    }

    private void showProfileMenu() {
        Dialog dialog = new Dialog(this);
        dialog.setContentView(R.layout.dialog_profile_menu);
        
        Window window = dialog.getWindow();
        if (window != null) {
            window.setLayout(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT);
            window.setBackgroundDrawable(new ColorDrawable(android.graphics.Color.TRANSPARENT));
            WindowManager.LayoutParams params = window.getAttributes();
            params.gravity = Gravity.TOP | Gravity.END;
            params.x = 50; // margin from right
            params.y = 150; // margin from top
            window.setAttributes(params);
        }

        // Setup profile menu content
        ImageView profilePicture = dialog.findViewById(R.id.iv_profile_menu_picture);
        TextView profileEmail = dialog.findViewById(R.id.tv_profile_email);
        TextView profileGreeting = dialog.findViewById(R.id.tv_profile_greeting);
        LinearLayout btnSeeProfile = dialog.findViewById(R.id.btn_see_profile_details);
        LinearLayout btnLogout = dialog.findViewById(R.id.btn_logout);

        if (currentUser != null) {
            profileEmail.setText(currentUser.getUsername() != null ? currentUser.getUsername() : "user@doar.com");
            profileGreeting.setText("Hi, " + (currentUser.getFirstName() != null ? currentUser.getFirstName() : "User"));
            
            // Load profile picture if available
            if (currentUser.getPicture() != null && !currentUser.getPicture().isEmpty()) {
                String imageUrl = ApiClient.getInstance().getBaseUrl() + currentUser.getPicture();
                Glide.with(this)
                    .load(imageUrl)
                    .placeholder(R.drawable.ic_account_circle)
                    .error(R.drawable.ic_account_circle)
                    .into(profilePicture);
            }
        }

        btnSeeProfile.setOnClickListener(v -> {
            dialog.dismiss();
            showProfileDetails();
        });

        btnLogout.setOnClickListener(v -> {
            dialog.dismiss();
            // TODO: Implement logout functionality
            showError("Logout functionality not implemented yet");
        });

        dialog.show();
    }

    private void showProfileDetails() {
        Dialog dialog = new Dialog(this);
        dialog.setContentView(R.layout.dialog_profile_details);
        
        Window window = dialog.getWindow();
        if (window != null) {
            window.setLayout(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
            window.setBackgroundDrawable(new ColorDrawable(android.graphics.Color.TRANSPARENT));
        }

        // Setup profile details content
        ImageButton btnClose = dialog.findViewById(R.id.btn_close);
        ImageView profilePicture = dialog.findViewById(R.id.iv_profile_picture);
        TextView firstName = dialog.findViewById(R.id.tv_first_name);
        TextView lastName = dialog.findViewById(R.id.tv_last_name);
        TextView email = dialog.findViewById(R.id.tv_email);
        TextView phone = dialog.findViewById(R.id.tv_phone);
        TextView birthday = dialog.findViewById(R.id.tv_birthday);
        TextView gender = dialog.findViewById(R.id.tv_gender);

        if (currentUser != null) {
            firstName.setText(currentUser.getFirstName() != null ? currentUser.getFirstName() : "Not provided");
            lastName.setText(currentUser.getLastName() != null ? currentUser.getLastName() : "Not provided");
            email.setText(currentUser.getUsername() != null ? currentUser.getUsername() : "Not provided");
            phone.setText(formatPhone(currentUser.getPhone()));
            birthday.setText(formatDate(currentUser.getBirthday()));
            gender.setText(formatGender(currentUser.getGender()));
            
            // Load profile picture if available
            if (currentUser.getPicture() != null && !currentUser.getPicture().isEmpty()) {
                String imageUrl = ApiClient.getInstance().getBaseUrl() + currentUser.getPicture();
                Glide.with(this)
                    .load(imageUrl)
                    .placeholder(R.drawable.ic_account_circle)
                    .error(R.drawable.ic_account_circle)
                    .into(profilePicture);
            }
        }

        btnClose.setOnClickListener(v -> dialog.dismiss());
        dialog.show();
    }

    private String formatPhone(String phone) {
        if (phone == null || phone.isEmpty()) return "Not provided";
        
        // Format Israeli phone number (0501234567 -> 050-123-4567)
        if (phone.length() == 10 && phone.startsWith("05")) {
            return phone.substring(0, 3) + "-" + phone.substring(3, 6) + "-" + phone.substring(6);
        }
        return phone;
    }

    private String formatDate(String dateString) {
        if (dateString == null || dateString.isEmpty()) return "Not provided";
        
        try {
            SimpleDateFormat inputFormat = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
            SimpleDateFormat outputFormat = new SimpleDateFormat("MMMM d, yyyy", Locale.getDefault());
            Date date = inputFormat.parse(dateString);
            return outputFormat.format(date);
        } catch (ParseException e) {
            return dateString;
        }
    }

    private String formatGender(String gender) {
        if (gender == null || gender.isEmpty()) return "Not provided";
        return gender.substring(0, 1).toUpperCase() + gender.substring(1).replace("_", " ");
    }

    private void onMailClick(Mail mail) {
        // TODO: Implement mail detail view
        showError("Mail detail view not implemented yet");
    }

    private void onStarClick(Mail mail) {
        // TODO: Implement star toggle functionality
        mail.setStarred(!mail.isStarred());
        mailAdapter.notifyDataSetChanged();
        showError("Star functionality not fully implemented yet");
    }

    private void showLoading(boolean show) {
        progressLoading.setVisibility(show ? View.VISIBLE : View.GONE);
        recyclerView.setVisibility(show ? View.GONE : View.VISIBLE);
    }

    private void updateEmptyState() {
        boolean isEmpty = filteredMails.isEmpty();
        emptyStateLayout.setVisibility(isEmpty ? View.VISIBLE : View.GONE);
        recyclerView.setVisibility(isEmpty ? View.GONE : View.VISIBLE);
    }

    private void showError(String message) {
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show();
    }
}