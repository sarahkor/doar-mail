package com.example.myapplication;
import android.content.Intent;
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
import com.example.myapplication.activities.ComposeActivity;
import com.example.myapplication.activities.LoginActivity;
import androidx.appcompat.app.AppCompatActivity;
import androidx.drawerlayout.widget.DrawerLayout;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;
import com.example.myapplication.adapters.LabelAdapter;
import com.example.myapplication.api.ApiClient;
import com.example.myapplication.api.ApiService;
import com.example.myapplication.databinding.ActivityMainBinding;
import com.example.myapplication.dialogs.ColorPickerDialog;
import com.example.myapplication.dialogs.DeleteLabelDialog;
import com.example.myapplication.dialogs.EditLabelDialog;
import com.example.myapplication.dialogs.LabelEmailDialog;
import com.example.myapplication.dialogs.LabelOptionsBottomSheet;
import com.example.myapplication.dialogs.NewLabelDialog;
import com.example.myapplication.models.Label;
import com.example.myapplication.models.Mail;
import com.example.myapplication.models.User;
import com.example.myapplication.utils.AuthManager;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.Set;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class MainActivity extends AppCompatActivity {

    private static final int COMPOSE_REQUEST_CODE = 1;
    
    private ActivityMainBinding binding;
    private DrawerLayout drawerLayout;
    private RecyclerView recyclerView;
    private MailAdapter mailAdapter;
    private ProgressBar progressLoading;
    private LinearLayout emptyStateLayout;
    
    // Label-related fields
    private RecyclerView labelsRecyclerView;
    private LabelAdapter labelAdapter;
    private List<Label> labels = new ArrayList<>();
    private ImageView btnAddLabel;
    
    private ApiService apiService;
    private AuthManager authManager;
    private User currentUser;
    private List<Mail> allMails = new ArrayList<>();
    private List<Mail> filteredMails = new ArrayList<>();
    
    private MailFolder currentFolder = MailFolder.INBOX;
    private View currentSelectedNavItem;
    
    // Selection mode fields
    private boolean isSelectionMode = false;
    private View actionModeBar;
    private TextView selectedCountText;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityMainBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        // Check authentication
        authManager = AuthManager.getInstance(this);
        if (!authManager.isLoggedIn()) {
            navigateToLogin();
            return;
        }

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
        
        // Initialize action mode bar
        actionModeBar = binding.actionModeBar;
        selectedCountText = binding.tvSelectedCount;
        
        // Setup action mode bar click listeners
        binding.btnCloseSelection.setOnClickListener(v -> exitSelectionMode());
        binding.btnDeleteMails.setOnClickListener(v -> deleteSelectedMails());
        binding.btnLabelMails.setOnClickListener(v -> showLabelDialog());
    }

    private void setupAPI() {
        apiService = ApiClient.getInstance().getApiService();
    }

    private void navigateToLogin() {
        Intent intent = new Intent(this, LoginActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
        finish();
    }

    private void logout() {
        // Clear authentication data
        authManager.logout();
        
        // Navigate to login
        navigateToLogin();
        
        Toast.makeText(this, "Logged out successfully", Toast.LENGTH_SHORT).show();
    }

    private void setupUI() {
        setupRecyclerView();
        setupSearchBar();
        setupNavigationButtons();
        setupNavigationDrawer();
        setupComposeButton();
    }
     private void setupComposeButton() {
        binding.fabCompose.setOnClickListener(v -> {
            Intent intent = new Intent(MainActivity.this, ComposeActivity.class);
            startActivityForResult(intent, COMPOSE_REQUEST_CODE);
        });
    }


    private void setupRecyclerView() {
        mailAdapter = new MailAdapter(filteredMails, this::onMailClick, this::onStarClick);
        mailAdapter.setOnMailLongClickListener(this::onMailLongClick);
        mailAdapter.setOnSelectionChangedListener(this::updateSelectedCount);
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
            if (drawerLayout.isDrawerOpen(Gravity.START)) {
                drawerLayout.closeDrawer(Gravity.START);
            } else {
                drawerLayout.openDrawer(Gravity.START);
            }
        });

        binding.btnProfile.setOnClickListener(v -> showProfileMenu());
    }

    private void setupNavigationDrawer() {
        View navDrawer = findViewById(R.id.nav_drawer_layout);
        if (navDrawer == null) {
            // Find the drawer by getting the first child of the drawer layout
            navDrawer = ((ViewGroup) drawerLayout.getChildAt(1)).getChildAt(0);
        }

        if (navDrawer != null) {
            setupNavigationItem(navDrawer, R.id.nav_inbox, MailFolder.INBOX);
            setupNavigationItem(navDrawer, R.id.nav_sent, MailFolder.SENT);
            setupNavigationItem(navDrawer, R.id.nav_drafts, MailFolder.DRAFTS);
            setupNavigationItem(navDrawer, R.id.nav_spam, MailFolder.SPAM);
            setupNavigationItem(navDrawer, R.id.nav_trash, MailFolder.TRASH);
            setupNavigationItem(navDrawer, R.id.nav_starred, MailFolder.STARRED);
            setupNavigationItem(navDrawer, R.id.nav_all_mail, MailFolder.ALL_MAIL);

            // Setup labels functionality
            setupLabelsSection(navDrawer);

            // Set initial selection
            View inboxItem = navDrawer.findViewById(R.id.nav_inbox);
            if (inboxItem != null) {
                selectNavigationItem(inboxItem, MailFolder.INBOX);
            }
        }
    }

    private void setupNavigationItem(View navDrawer, int itemId, MailFolder folder) {
        View item = navDrawer.findViewById(itemId);
        if (item != null) {
            item.setOnClickListener(v -> {
                selectNavigationItem(v, folder);
                drawerLayout.closeDrawer(Gravity.START);
            });
        }
    }

    private void selectNavigationItem(View item, MailFolder folder) {
        // Clear previous selection
        if (currentSelectedNavItem != null) {
            currentSelectedNavItem.setBackgroundResource(android.R.color.transparent);
        }

        // Set new selection
        currentSelectedNavItem = item;
        item.setBackgroundResource(R.drawable.nav_item_selected);
        
        currentFolder = folder;
        loadMailsForFolder(folder);
        
        // Update action bar title
        setTitle(folder.getDisplayName());
    }

    private void setupLabelsSection(View navDrawer) {
        // Initialize labels RecyclerView
        labelsRecyclerView = navDrawer.findViewById(R.id.rv_labels);
        btnAddLabel = navDrawer.findViewById(R.id.btn_add_label);

        if (labelsRecyclerView != null) {
            labelAdapter = new LabelAdapter(this, labels);
            labelsRecyclerView.setLayoutManager(new LinearLayoutManager(this));
            labelsRecyclerView.setAdapter(labelAdapter);

            // Set up label click listeners
            labelAdapter.setOnLabelClickListener(this::onLabelClick);
            labelAdapter.setOnLabelEditClickListener(this::onLabelEditClick);
        }

        if (btnAddLabel != null) {
            btnAddLabel.setOnClickListener(v -> showNewLabelDialog());
        }

        // Load labels from server
        loadLabels();
    }

    private void loadLabels() {
        apiService.getLabels(authManager.getBearerToken()).enqueue(new Callback<List<Label>>() {
            @Override
            public void onResponse(Call<List<Label>> call, Response<List<Label>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    labels.clear();
                    labels.addAll(response.body());
                    if (labelAdapter != null) {
                        labelAdapter.notifyDataSetChanged();
                    }
                } else {
                    // Load demo labels for testing
                    loadDemoLabels();
                }
            }

            @Override
            public void onFailure(Call<List<Label>> call, Throwable t) {
                // Load demo labels for testing
                loadDemoLabels();
            }
        });
    }

    private void loadDemoLabels() {
        labels.clear();
        
        Label workLabel = new Label();
        workLabel.setId(1);
        workLabel.setName("Work");
        workLabel.setColor("#FF4444");
        labels.add(workLabel);

        Label personalLabel = new Label();
        personalLabel.setId(2);
        personalLabel.setName("Personal");
        personalLabel.setColor("#00C851");
        labels.add(personalLabel);

        Label importantLabel = new Label();
        importantLabel.setId(3);
        importantLabel.setName("Important");
        importantLabel.setColor("#FF8800");
        labels.add(importantLabel);

        if (labelAdapter != null) {
            labelAdapter.notifyDataSetChanged();
        }
    }

    private void onLabelClick(Label label) {
        // TODO: Implement filtering mails by label
        showError("Label filtering not implemented yet");
        drawerLayout.closeDrawer(Gravity.START);
    }

    private void onLabelEditClick(Label label) {
        LabelOptionsBottomSheet bottomSheet = LabelOptionsBottomSheet.newInstance(label);
        bottomSheet.setOnOptionSelectedListener(new LabelOptionsBottomSheet.OnOptionSelectedListener() {
            @Override
            public void onColorOptionSelected(Label label) {
                showColorPickerDialog(label);
            }

            @Override
            public void onEditOptionSelected(Label label) {
                showEditLabelDialog(label);
            }

            @Override
            public void onDeleteOptionSelected(Label label) {
                showDeleteLabelDialog(label);
            }
        });
        bottomSheet.show(getSupportFragmentManager(), "LabelOptionsBottomSheet");
    }

    private void showNewLabelDialog() {
        NewLabelDialog dialog = NewLabelDialog.newInstance();
        dialog.setOnLabelCreatedListener(this::createLabel);
        dialog.show(getSupportFragmentManager(), "NewLabelDialog");
    }

    private void showEditLabelDialog(Label label) {
        EditLabelDialog dialog = EditLabelDialog.newInstance(label);
        dialog.setOnLabelEditedListener(this::updateLabel);
        dialog.show(getSupportFragmentManager(), "EditLabelDialog");
    }

    private void showColorPickerDialog(Label label) {
        ColorPickerDialog dialog = ColorPickerDialog.newInstance(label);
        dialog.setOnColorSelectedListener(this::updateLabelColor);
        dialog.show(getSupportFragmentManager(), "ColorPickerDialog");
    }

    private void showDeleteLabelDialog(Label label) {
        DeleteLabelDialog dialog = DeleteLabelDialog.newInstance(label);
        dialog.setOnLabelDeletedListener(this::deleteLabel);
        dialog.show(getSupportFragmentManager(), "DeleteLabelDialog");
    }

    private void createLabel(String name, String color) {
        ApiService.CreateLabelRequest request = new ApiService.CreateLabelRequest(name, color, null);
        
        apiService.createLabel(authManager.getBearerToken(), request).enqueue(new Callback<Label>() {
            @Override
            public void onResponse(Call<Label> call, Response<Label> response) {
                if (response.isSuccessful() && response.body() != null) {
                    labels.add(response.body());
                    if (labelAdapter != null) {
                        labelAdapter.notifyDataSetChanged();
                    }
                    showError("Label created successfully");
                } else {
                    showError("Failed to create label");
                }
            }

            @Override
            public void onFailure(Call<Label> call, Throwable t) {
                showError("Network error: " + t.getMessage());
            }
        });
    }

    private void updateLabel(int labelId, String newName) {
        ApiService.UpdateLabelRequest request = new ApiService.UpdateLabelRequest(newName, null);
        
        apiService.updateLabel(authManager.getBearerToken(), labelId, request).enqueue(new Callback<Label>() {
            @Override
            public void onResponse(Call<Label> call, Response<Label> response) {
                if (response.isSuccessful() && response.body() != null) {
                    // Update local label
                    for (int i = 0; i < labels.size(); i++) {
                        if (labels.get(i).getId() == labelId) {
                            labels.set(i, response.body());
                            break;
                        }
                    }
                    if (labelAdapter != null) {
                        labelAdapter.notifyDataSetChanged();
                    }
                    showError("Label updated successfully");
                } else {
                    showError("Failed to update label");
                }
            }

            @Override
            public void onFailure(Call<Label> call, Throwable t) {
                showError("Network error: " + t.getMessage());
            }
        });
    }

    private void updateLabelColor(int labelId, String color) {
        ApiService.ColorRequest request = new ApiService.ColorRequest(color);
        
        apiService.updateLabelColor(authManager.getBearerToken(), labelId, request).enqueue(new Callback<Label>() {
            @Override
            public void onResponse(Call<Label> call, Response<Label> response) {
                if (response.isSuccessful() && response.body() != null) {
                    // Update local label
                    for (int i = 0; i < labels.size(); i++) {
                        if (labels.get(i).getId() == labelId) {
                            labels.set(i, response.body());
                            break;
                        }
                    }
                    if (labelAdapter != null) {
                        labelAdapter.notifyDataSetChanged();
                    }
                    showError("Label color updated successfully");
                } else {
                    showError("Failed to update label color");
                }
            }

            @Override
            public void onFailure(Call<Label> call, Throwable t) {
                showError("Network error: " + t.getMessage());
            }
        });
    }

    private void deleteLabel(int labelId) {
        apiService.deleteLabel(authManager.getBearerToken(), labelId).enqueue(new Callback<ApiService.ApiResponse>() {
            @Override
            public void onResponse(Call<ApiService.ApiResponse> call, Response<ApiService.ApiResponse> response) {
                if (response.isSuccessful()) {
                    // Remove from local list
                    labels.removeIf(label -> label.getId() == labelId);
                    if (labelAdapter != null) {
                        labelAdapter.notifyDataSetChanged();
                    }
                    showError("Label deleted successfully");
                } else {
                    showError("Failed to delete label");
                }
            }

            @Override
            public void onFailure(Call<ApiService.ApiResponse> call, Throwable t) {
                showError("Network error: " + t.getMessage());
            }
        });
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
        
        apiService.getCurrentUser(authManager.getBearerToken()).enqueue(new Callback<ApiService.UserResponse>() {
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
        loadMailsForFolder(currentFolder);
    }

    private void loadMailsForFolder(MailFolder folder) {
        showLoading(true);
        
        Call<ApiService.PaginatedMailResponse> call;
        switch (folder) {
            case INBOX:
                call = apiService.getInbox(authManager.getBearerToken());
                break;
            case SENT:
                call = apiService.getSent(authManager.getBearerToken());
                break;
            case DRAFTS:
                call = apiService.getDrafts(authManager.getBearerToken());
                break;
            case SPAM:
                call = apiService.getSpam(authManager.getBearerToken());
                break;
            case TRASH:
                call = apiService.getTrash(authManager.getBearerToken());
                break;
            case STARRED:
                call = apiService.getStarred(authManager.getBearerToken());
                break;
            case ALL_MAIL:
            default:
                call = apiService.getAllMails(authManager.getBearerToken());
                break;
        }
        
        call.enqueue(new Callback<ApiService.PaginatedMailResponse>() {
            @Override
            public void onResponse(Call<ApiService.PaginatedMailResponse> call, Response<ApiService.PaginatedMailResponse> response) {
                showLoading(false);
                if (response.isSuccessful() && response.body() != null && response.body().getMails() != null) {
                    allMails.clear();
                    
                    // Process each mail to convert IDs and handle server fields
                    for (Mail mail : response.body().getMails()) {
                        mail.convertIdFromString(); // Convert MongoDB ObjectId to integer
                        allMails.add(mail);
                    }
                    
                    // Clear search when switching folders
                    binding.etSearch.setText("");
                    
                    filteredMails.clear();
                    filteredMails.addAll(allMails);
                    mailAdapter.notifyDataSetChanged();
                    updateEmptyState();
                } else {
                    showError("Failed to load " + folder.getDisplayName().toLowerCase() + " mails");
                }
            }

            @Override
            public void onFailure(Call<ApiService.PaginatedMailResponse> call, Throwable t) {
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
            logout();
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

    private void onMailLongClick(Mail mail) {
        enterSelectionMode();
        mailAdapter.toggleSelection(mail.getId());
        // updateSelectedCount() is called via the OnSelectionChangedListener
    }

    private void enterSelectionMode() {
        if (!isSelectionMode) {
            isSelectionMode = true;
            mailAdapter.setSelectionMode(true);
            actionModeBar.setVisibility(View.VISIBLE);
            
            // Hide the search bar when in selection mode
            binding.btnMenu.setVisibility(View.GONE);
            binding.btnProfile.setVisibility(View.GONE);
        }
    }

    private void exitSelectionMode() {
        if (isSelectionMode) {
            isSelectionMode = false;
            mailAdapter.setSelectionMode(false);
            actionModeBar.setVisibility(View.GONE);
            
            // Show the search bar again
            binding.btnMenu.setVisibility(View.VISIBLE);
            binding.btnProfile.setVisibility(View.VISIBLE);
        }
    }

    private void updateSelectedCount() {
        int count = mailAdapter.getSelectedCount();
        if (count == 0) {
            exitSelectionMode();
        } else {
            selectedCountText.setText(count + " selected");
        }
    }

    private void deleteSelectedMails() {
        Set<Integer> selectedIds = mailAdapter.getSelectedMails();
        if (selectedIds.isEmpty()) {
            showError("No emails selected");
            return;
        }

        // Show confirmation dialog
        new androidx.appcompat.app.AlertDialog.Builder(this)
            .setTitle("Delete Emails")
            .setMessage("Are you sure you want to delete " + selectedIds.size() + " email(s)?")
            .setPositiveButton("Delete", (dialog, which) -> {
                // TODO: Implement actual deletion via API
                // For now, just remove from the local list
                filteredMails.removeIf(mail -> selectedIds.contains(mail.getId()));
                allMails.removeIf(mail -> selectedIds.contains(mail.getId()));
                mailAdapter.notifyDataSetChanged();
                exitSelectionMode();
                updateEmptyState();
                showError("Emails deleted (local only - API not implemented)");
            })
            .setNegativeButton("Cancel", null)
            .show();
    }

    private void showLabelDialog() {
        Set<Integer> selectedIds = mailAdapter.getSelectedMails();
        if (selectedIds.isEmpty()) {
            showError("No emails selected");
            return;
        }

        // Get the first selected mail for display purposes
        Mail firstMail = null;
        for (Mail mail : filteredMails) {
            if (selectedIds.contains(mail.getId())) {
                firstMail = mail;
                break;
            }
        }

        String mailSubject = firstMail != null ? firstMail.getDisplaySubject() : "Selected emails";
        boolean isSingleMail = selectedIds.size() == 1;

        LabelEmailDialog dialog = LabelEmailDialog.newInstance(selectedIds, isSingleMail, mailSubject);
        dialog.setOnLabelsAppliedListener(() -> {
            exitSelectionMode();
            // Optionally refresh the mail list or update UI
        });
        dialog.show(getSupportFragmentManager(), "LabelEmailDialog");
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

    @Override
    public void onBackPressed() {
        if (isSelectionMode) {
            exitSelectionMode();
        } else if (drawerLayout.isDrawerOpen(Gravity.START)) {
            drawerLayout.closeDrawer(Gravity.START);
        } else {
            super.onBackPressed();
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        
        if (requestCode == COMPOSE_REQUEST_CODE && resultCode == RESULT_OK) {
            // Email was sent successfully, refresh the current folder
            loadMails();
        }
    }
}