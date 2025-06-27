package com.example.myapplication.activities;

import android.os.Bundle;
import android.text.TextUtils;
import android.view.WindowManager;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.example.myapplication.R;

public class ComposeActivity extends AppCompatActivity {

    private EditText etTo, etSubject, etBody;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_compose);

        // Initialize input fields
        etTo = findViewById(R.id.et_to);
        etSubject = findViewById(R.id.et_subject);
        etBody = findViewById(R.id.et_body);

        // Initialize icon buttons
        ImageButton btnSend = findViewById(R.id.btn_send);
        ImageButton btnAttach = findViewById(R.id.btn_attach);
        ImageButton btnDelete = findViewById(R.id.btn_delete);
        ImageButton btnClose = findViewById(R.id.btn_close);

        // Set focus to 'To' field and show keyboard manually
        etTo.requestFocus();
        etTo.postDelayed(() -> {
            etTo.requestFocus();
            getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE);
            android.view.inputmethod.InputMethodManager imm =
                    (android.view.inputmethod.InputMethodManager) getSystemService(INPUT_METHOD_SERVICE);
            if (imm != null) {
                imm.showSoftInput(etTo, android.view.inputmethod.InputMethodManager.SHOW_IMPLICIT);
            }
        }, 150); // small delay ensures keyboard pops after layout

        // Handle send icon
        btnSend.setOnClickListener(v -> sendMail());

        btnAttach.setOnClickListener(v ->
                Toast.makeText(this, "Attach clicked (not implemented)", Toast.LENGTH_SHORT).show()
        );

        btnDelete.setOnClickListener(v -> {
            etTo.setText("");
            etSubject.setText("");
            etBody.setText("");
            Toast.makeText(this, "Fields cleared", Toast.LENGTH_SHORT).show();
        });

        btnClose.setOnClickListener(v -> finish());
    }


    private void sendMail() {
        String to = etTo.getText().toString().trim();
        String subject = etSubject.getText().toString().trim();
        String body = etBody.getText().toString().trim();

        if (TextUtils.isEmpty(to) || TextUtils.isEmpty(subject) || TextUtils.isEmpty(body)) {
            Toast.makeText(this, "Please fill all fields", Toast.LENGTH_SHORT).show();
            return;
        }

        // TODO: Implement API call to send mail
        Toast.makeText(this, "Mail sent successfully!", Toast.LENGTH_SHORT).show();
        finish();
    }
}
