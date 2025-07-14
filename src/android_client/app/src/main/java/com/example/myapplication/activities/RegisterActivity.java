package com.example.myapplication.activities;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import android.text.Editable;
import android.text.TextUtils;
import android.text.TextWatcher;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.ProgressBar;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.bumptech.glide.Glide;
import com.example.myapplication.R;
import com.example.myapplication.api.ApiClient;
import com.example.myapplication.api.ApiService;
import com.example.myapplication.utils.FileUtils;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Locale;

import okhttp3.MediaType;
import okhttp3.MultipartBody;
import okhttp3.RequestBody;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class RegisterActivity extends AppCompatActivity {

    private EditText etFirstName;
    private EditText etLastName;
    private EditText etUsername;
    private EditText etPassword;
    private EditText etConfirmPassword;
    private EditText etBirthDate;
    private Spinner spinnerGender;
    private Button btnProfilePhoto;
    private ImageView ivProfilePhoto;
    private Button btnRegister;
    private ProgressBar progressBar;
    private TextView tvError;
    private TextView tvBackToLogin;
    private ApiService apiService;
    private Uri selectedImageUri;
    private static final int PICK_IMAGE_REQUEST = 1;
    private String selectedGender = "";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_register);

        initializeViews();
        setupAPI();
        setupGenderSpinner();
        setupClickListeners();
        setupFieldValidation();
    }

    private void initializeViews() {
        etFirstName = findViewById(R.id.et_first_name);
        etLastName = findViewById(R.id.et_last_name);
        etUsername = findViewById(R.id.et_username);
        etPassword = findViewById(R.id.et_password);
        etConfirmPassword = findViewById(R.id.et_confirm_password);
        etBirthDate = findViewById(R.id.et_birth_date);
        spinnerGender = findViewById(R.id.spinner_gender);
        btnProfilePhoto = findViewById(R.id.btn_profile_photo);
        ivProfilePhoto = findViewById(R.id.iv_profile_photo);
        btnRegister = findViewById(R.id.btn_register);
        progressBar = findViewById(R.id.progress_bar);
        tvError = findViewById(R.id.tv_error);
        tvBackToLogin = findViewById(R.id.tv_back_to_login);
    }

    private void setupAPI() {
        apiService = ApiClient.getInstance().getApiService();
    }

    private void setupGenderSpinner() {
        ArrayAdapter<CharSequence> adapter = ArrayAdapter.createFromResource(
                this,
                R.array.gender_options,
                android.R.layout.simple_spinner_item
        );
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinnerGender.setAdapter(adapter);
        spinnerGender.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                String[] genderValues = {"female", "male", "prefer_not_to_say"};
                selectedGender = genderValues[position];
                validateFields();
            }
            @Override
            public void onNothingSelected(AdapterView<?> parent) {
                selectedGender = "";
                validateFields();
            }
        });
    }

    private void setupClickListeners() {
        btnProfilePhoto.setOnClickListener(v -> openImagePicker());
        etBirthDate.setOnClickListener(v -> showDatePicker());
        btnRegister.setOnClickListener(v -> {
            Toast.makeText(this, "Continue pressed", Toast.LENGTH_SHORT).show();
            attemptRegister();
        });
        tvBackToLogin.setOnClickListener(v -> navigateToLogin());
    }

    private void setupFieldValidation() {
        TextWatcher watcher = new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}
            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                validateFields();
            }
            @Override
            public void afterTextChanged(Editable s) {}
        };
        etFirstName.addTextChangedListener(watcher);
        etLastName.addTextChangedListener(watcher);
        etUsername.addTextChangedListener(watcher);
        etPassword.addTextChangedListener(watcher);
        etConfirmPassword.addTextChangedListener(watcher);
        etBirthDate.addTextChangedListener(watcher);
    }

    private void validateFields() {
        String errorMsg = null;

        String firstName = etFirstName.getText().toString().trim();
        String username = etUsername.getText().toString().trim();
        String password = etPassword.getText().toString();
        String confirmPassword = etConfirmPassword.getText().toString();
        String birthDate = etBirthDate.getText().toString().trim();

        if (TextUtils.isEmpty(firstName)) {
            errorMsg = "First name is required";
        } else if (TextUtils.isEmpty(username)) {
            errorMsg = "Username is required";
        } else if (!username.endsWith("@doar.com")) {
            errorMsg = "Username must end with @doar.com";
        } else if (!android.util.Patterns.EMAIL_ADDRESS.matcher(username).matches()) {
            errorMsg = "Invalid email format";
        } else if (TextUtils.isEmpty(password)) {
            errorMsg = "Password is required";
        } else if (!isValidPassword(password)) {
            errorMsg = "Password must be at least 8 chars, include upper, lower, number, special";
        } else if (!password.equals(confirmPassword)) {
            errorMsg = "Passwords do not match";
        } else if (TextUtils.isEmpty(birthDate)) {
            errorMsg = "Birth date is required";
        } else if (!isValidPastDate(birthDate)) {
            errorMsg = "Birth date must be a valid past date";
        } else if (TextUtils.isEmpty(selectedGender)) {
            errorMsg = "Please select a gender";
        }

        btnRegister.setEnabled(errorMsg == null);
        tvError.setText(errorMsg != null ? errorMsg : "");
        tvError.setVisibility(errorMsg != null ? View.VISIBLE : View.GONE);
    }

    private void attemptRegister() {
        String firstName = etFirstName.getText().toString().trim();
        String lastName = etLastName.getText().toString().trim();
        String username = etUsername.getText().toString().trim();
        String password = etPassword.getText().toString().trim();
        String confirmPassword = etConfirmPassword.getText().toString().trim();
        String birthDate = etBirthDate.getText().toString().trim();
        String gender = selectedGender;

        // Name validation: only letters (including Hebrew) and spaces
        String nameRegex = "^[a-zA-Z\u0590-\u05FF\\s]+$";
        if (!firstName.matches(nameRegex)) {
            etFirstName.setError("First name can only contain letters.");
            etFirstName.requestFocus();
            return;
        }
        if (!lastName.isEmpty() && !lastName.matches(nameRegex)) {
            etLastName.setError("Last name can only contain letters.");
            etLastName.requestFocus();
            return;
        }

        // Validation
        if (TextUtils.isEmpty(firstName)) {
            etFirstName.setError("First name is required");
            etFirstName.requestFocus();
            return;
        }
        // Last name is optional, no check
        if (TextUtils.isEmpty(username)) {
            etUsername.setError("Username is required");
            etUsername.requestFocus();
            return;
        }
        if (!username.endsWith("@doar.com")) {
            etUsername.setError("Username must end with @doar.com");
            etUsername.requestFocus();
            return;
        }
        if (!android.util.Patterns.EMAIL_ADDRESS.matcher(username).matches()) {
            etUsername.setError("Invalid email format");
            etUsername.requestFocus();
            return;
        }
        if (TextUtils.isEmpty(password)) {
            etPassword.setError("Password is required");
            etPassword.requestFocus();
            return;
        }
        if (!isValidPassword(password)) {
            etPassword.setError("Password must be at least 8 chars, include upper, lower, number, special");
            etPassword.requestFocus();
            return;
        }
        if (!password.equals(confirmPassword)) {
            etConfirmPassword.setError("Passwords do not match");
            etConfirmPassword.requestFocus();
            return;
        }
        if (TextUtils.isEmpty(birthDate)) {
            etBirthDate.setError("Birth date is required");
            etBirthDate.requestFocus();
            return;
        }
        if (!isValidPastDate(birthDate)) {
            etBirthDate.setError("Birth date must be a valid past date");
            etBirthDate.requestFocus();
            return;
        }
        if (TextUtils.isEmpty(gender)) {
            Toast.makeText(this, "Please select a gender", Toast.LENGTH_SHORT).show();
            return;
        }

        setLoadingState(true);
        clearError();

        // Prepare multipart request bodies
        RequestBody firstNameBody = RequestBody.create(MediaType.parse("text/plain"), firstName);
        RequestBody lastNameBody = RequestBody.create(MediaType.parse("text/plain"), lastName);
        RequestBody usernameBody = RequestBody.create(MediaType.parse("text/plain"), username);
        RequestBody passwordBody = RequestBody.create(MediaType.parse("text/plain"), password);
        RequestBody birthdayBody = RequestBody.create(MediaType.parse("text/plain"), birthDate);
        RequestBody genderBody = RequestBody.create(MediaType.parse("text/plain"), gender);
        MultipartBody.Part photoPart = null;
        if (selectedImageUri != null) {
            try {
                String filePath = FileUtils.getPath(this, selectedImageUri);
                java.io.File file = new java.io.File(filePath);
                RequestBody reqFile = RequestBody.create(MediaType.parse(getContentResolver().getType(selectedImageUri)), file);
                photoPart = MultipartBody.Part.createFormData("profilePicture", file.getName(), reqFile);
            } catch (Exception e) {
                showError("Failed to process selected photo");
                setLoadingState(false);
                return;
            }
        }

        Call<ApiService.RegisterResponse> call = apiService.register(
                firstNameBody,
                lastNameBody,
                usernameBody,
                passwordBody,
                birthdayBody,
                genderBody,
                photoPart
        );
        call.enqueue(new Callback<ApiService.RegisterResponse>() {
            @Override
            public void onResponse(Call<ApiService.RegisterResponse> call, Response<ApiService.RegisterResponse> response) {
                setLoadingState(false);
                if (response.isSuccessful() && response.body() != null) {
                    ApiService.RegisterResponse registerResponse = response.body();
                    if ("success".equals(registerResponse.getStatus())) {
                        Toast.makeText(RegisterActivity.this, "Registration successful! Please login.", Toast.LENGTH_LONG).show();
                        navigateToLogin();
                    } else {
                        showError(registerResponse.getMessage() != null ? registerResponse.getMessage() : "Registration failed");
                    }
                } else {
                    String errorMessage = "Registration failed. Please try again.";
                    if (response.code() == 409) {
                        errorMessage = "Username already exists";
                    } else if (response.code() == 400) {
                        errorMessage = "Invalid registration data";
                    } else if (response.code() == 500) {
                        errorMessage = "Server error. Please try again later.";
                    }
                    showError(errorMessage);
                }
            }
            @Override
            public void onFailure(Call<ApiService.RegisterResponse> call, Throwable t) {
                setLoadingState(false);
                showError("Network error. Please check your connection.");
            }
        });
    }

    private void setLoadingState(boolean isLoading) {
        btnRegister.setEnabled(!isLoading);
        etFirstName.setEnabled(!isLoading);
        etLastName.setEnabled(!isLoading);
        etUsername.setEnabled(!isLoading);
        etPassword.setEnabled(!isLoading);
        etConfirmPassword.setEnabled(!isLoading);
        etBirthDate.setEnabled(!isLoading);
        spinnerGender.setEnabled(!isLoading);
        btnProfilePhoto.setEnabled(!isLoading);
    }

    private void showError(String message) {
        tvError.setText(message);
        tvError.setVisibility(View.VISIBLE);
    }

    private void clearError() {
        tvError.setVisibility(View.GONE);
    }

    private void navigateToLogin() {
        Intent intent = new Intent(RegisterActivity.this, LoginActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
        startActivity(intent);
        finish();
    }

    private void openImagePicker() {
        Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
        intent.setType("image/*");
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        startActivityForResult(Intent.createChooser(intent, "Select Picture"), PICK_IMAGE_REQUEST);
    }

    private void showDatePicker() {
        Calendar calendar = Calendar.getInstance();
        int year = calendar.get(Calendar.YEAR);
        int month = calendar.get(Calendar.MONTH);
        int day = calendar.get(Calendar.DAY_OF_MONTH);
        android.app.DatePickerDialog datePickerDialog = new android.app.DatePickerDialog(
                this,
                (view, selectedYear, selectedMonth, selectedDay) -> {
                    String date = String.format(Locale.getDefault(), "%04d-%02d-%02d", selectedYear, selectedMonth + 1, selectedDay);
                    etBirthDate.setText(date);
                },
                year, month, day
        );
        datePickerDialog.show();
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == PICK_IMAGE_REQUEST && resultCode == RESULT_OK && data != null) {
            selectedImageUri = data.getData();
            if (selectedImageUri != null) {
                Glide.with(this)
                        .load(selectedImageUri)
                        .circleCrop()
                        .into(ivProfilePhoto);
            }
        }
    }

    // Password validation: min 8 chars, upper, lower, number, special
    private boolean isValidPassword(String password) {
        if (password.length() < 8) return false;
        boolean hasUpper = false, hasLower = false, hasDigit = false, hasSpecial = false;
        for (char c : password.toCharArray()) {
            if (Character.isUpperCase(c)) hasUpper = true;
            else if (Character.isLowerCase(c)) hasLower = true;
            else if (Character.isDigit(c)) hasDigit = true;
            else hasSpecial = true;
        }
        return hasUpper && hasLower && hasDigit && hasSpecial;
    }

    // Date validation: must be valid and in the past
    private boolean isValidPastDate(String dateStr) {
        try {
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
            sdf.setLenient(false);
            java.util.Date date = sdf.parse(dateStr);
            return date != null && date.before(new java.util.Date());
        } catch (Exception e) {
            return false;
        }
    }
} 