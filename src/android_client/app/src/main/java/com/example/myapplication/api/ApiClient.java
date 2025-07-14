package com.example.myapplication.api;

import okhttp3.OkHttpClient;
import okhttp3.logging.HttpLoggingInterceptor;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class ApiClient {
    // Try this IP if 192.168.1.150 doesn't work. Check your phone's WiFi settings to see which network it's connected to.
    // Alternative IPs from your computer: 192.168.75.1, 192.168.132.1, or 172.26.208.1
    private static final String BASE_URL = "http://192.168.1.150:8080/"; // Use actual computer IP for physical device
    private static ApiClient instance;
    private ApiService apiService;

    private ApiClient() {
        // Create logging interceptor
        HttpLoggingInterceptor loggingInterceptor = new HttpLoggingInterceptor();
        loggingInterceptor.setLevel(HttpLoggingInterceptor.Level.BODY);

        // Create OkHttp client
        OkHttpClient okHttpClient = new OkHttpClient.Builder()
                .addInterceptor(loggingInterceptor)
                .build();

        // Create Retrofit instance
        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(BASE_URL)
                .client(okHttpClient)
                .addConverterFactory(GsonConverterFactory.create())
                .build();

        apiService = retrofit.create(ApiService.class);
    }

    public static synchronized ApiClient getInstance() {
        if (instance == null) {
            instance = new ApiClient();
        }
        return instance;
    }

    public ApiService getApiService() {
        return apiService;
    }

    public String getBaseUrl() {
        return BASE_URL;
    }
} 