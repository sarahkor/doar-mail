package com.example.myapplication.utils;

import static android.app.Activity.RESULT_OK;
import android.Manifest;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.Build;
import android.os.ParcelFileDescriptor;
import android.provider.MediaStore;
import android.util.Log;
import android.widget.ImageView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.core.content.FileProvider;

import java.io.File;
import java.io.FileDescriptor;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;

public class PhotoHandler {
    private static final int PERM_CODE_CAMERA = 101;
    private static final int CAMERA_REQUEST = 102;
    private static final int GALLERY_PERM = 103;
    private static final int GALLERY_REQ = 104;
    private static final int ZERO = 0;
    private static final int PHOTOQ = 100;

    private ImageView imageView;
    private Activity activity;
    public Uri uri;
    public PhotoHandler(ImageView imageView, Activity activity) {
        this.imageView = imageView;
        this.activity = activity;
    }
    public void checkPermissionAndOpenGallery() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(activity, Manifest.permission.READ_MEDIA_IMAGES)
                    != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(activity, new String[]
                        {Manifest.permission.READ_MEDIA_IMAGES}, GALLERY_REQ);
            } else {
                openGallery();
            }
        } else if (ContextCompat.checkSelfPermission(activity, Manifest.permission.READ_EXTERNAL_STORAGE)
                != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(activity, new String[]
                    {Manifest.permission.READ_EXTERNAL_STORAGE}, GALLERY_REQ);
        } else {
            openGallery();
        }
    }

    public void askCameraPermissions(){
        if (ContextCompat.checkSelfPermission
                (activity, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions
                    (activity, new String[] {Manifest.permission.CAMERA}, PERM_CODE_CAMERA);
        } else {
            openCamera();
        }
    }
    public void onRequestPermissionsResult
            (int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        if (requestCode == PERM_CODE_CAMERA) {
            if (grantResults.length > ZERO
                    && grantResults[ZERO] == PackageManager.PERMISSION_GRANTED) {
                openCamera();
            } else {
                Toast.makeText(activity, "Camera Permission is Required to Use camera."
                        , Toast.LENGTH_SHORT).show();
            }
        }
        if (requestCode == GALLERY_REQ) {
            if (grantResults.length > ZERO &&
                    grantResults[ZERO] == PackageManager.PERMISSION_GRANTED) {
                openGallery();
            } else {
                Toast.makeText(activity, "Permission denied to read your External storage"
                        , Toast.LENGTH_SHORT).show();
            }
        }
    }
    public void openCamera() {
        Intent camera = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
        activity.startActivityForResult(camera, CAMERA_REQUEST);
    }
    public void openGallery() {
        Intent gallery = new Intent
                (Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI);
        activity.startActivityForResult(gallery, GALLERY_PERM);
    }
    public Bitmap onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        if (resultCode == RESULT_OK) {
            Uri photoHolderUri = null;
            if (requestCode == CAMERA_REQUEST && data != null && data.getExtras() != null) {
                Bitmap photoHolderBitmap = (Bitmap) data.getExtras().get("data");
                if (photoHolderBitmap != null) {
                    photoHolderUri = bitmapToUri(photoHolderBitmap, activity);
                    imageView.setImageURI(photoHolderUri);
                    this.uri = photoHolderUri;
                }
            }
            if (requestCode == GALLERY_PERM && data != null) {
                photoHolderUri = data.getData();
                if (photoHolderUri != null) {
                    imageView.setImageURI(photoHolderUri);
                    this.uri = photoHolderUri;
                }
            }
            if (photoHolderUri != null) {
                return getBitmapFromUri(photoHolderUri, activity);
            }
        }
        return null;
    }

    public static Uri bitmapToUri(Bitmap image, Context context) {
        File imagesFolder = new File(context.getCacheDir(), "images");
        Uri uri = null;
        try {
            imagesFolder.mkdirs();
            File file = new File(imagesFolder, "captured_image.jpg");
            FileOutputStream stream = new FileOutputStream(file);
            image.compress(Bitmap.CompressFormat.JPEG, PHOTOQ, stream);
            stream.flush();
            stream.close();
            uri = FileProvider.getUriForFile(context.getApplicationContext(),
                    "com.example.myapplication"+".provider", file);
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return uri;
    }
    public Bitmap getBitmapFromUri(Uri uri, Context context) {
        if (uri == null) {
            Log.e("PhotoHandler", "URI for bitmap is null");
            return null;
        }
        Bitmap bitmap = null;
        try {
            ParcelFileDescriptor parcelFileDescriptor = context.getContentResolver().openFileDescriptor(uri, "r");
            if (parcelFileDescriptor != null) {
                FileDescriptor fileDescriptor = parcelFileDescriptor.getFileDescriptor();
                bitmap = BitmapFactory.decodeFileDescriptor(fileDescriptor);
                parcelFileDescriptor.close();
            }
        } catch (IOException e) {
            Log.e("PhotoHandler", "Failed to load image from URI", e);
        }
        return bitmap;
    }

} 