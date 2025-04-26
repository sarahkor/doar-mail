# URL Filtering System Using Bloom Filter

This project implements a **Bloom Filter-based URL filtering system**  
as part of an assignment in the **"Advanced Programming Systems"** course.  
The system is designed to **efficiently detect** if a URL is blacklisted,  
while using **minimal memory** and allowing for **fast checks**.  
The application was developed using **Test-Driven Development (TDD)** methodology.

---

# 🧠 Project Overview
- Implemented a Bloom Filter that supports inserting and checking URLs.
- Used multiple hashing techniques (std::hash applied multiple times).
- Saved and loaded the Bloom Filter state from a binary file automatically.
- Supported false positives, but no false negatives.
- Input is received via standard input, and output is written to standard output.
- Carefully follows SOLID principles and supports future extension.

---

# How to Compile and Run

## Compile and Run the Application (Locally)

Compile:
g++ -std=c++17 -I src src/main.cpp src/main/app/*.cpp src/main/commands/*.cpp src/core/*.cpp -o app.exe

Run the Application:
./app.exe

---

# How to Run Unit Tests

## Compile Unit Tests (Locally)

Compile the unit tests:
g++ -std=c++17 -I src src/tests/bloom_hash_tests/*.cpp src/tests/storage_test/*.cpp src/tests/commands_tests/*.cpp src/main/commands/*.cpp src/core/*.cpp src/main/app/*.cpp src/main.cpp -o tests

Run the unit tests:
./tests

---

# How to Run Using Docker

## Build the Docker Image
docker build -t gmail-app .

## Run the Application inside Docker
docker run --rm -it gmail-app ./app.exe

## Run the Unit Tests inside Docker
docker-compose up --build

---

# 🧩 How It Works
1. Initialization:
   - User specifies the Bloom filter size and hash function configuration.

2. Commands:
   - 1 <URL> → Add URL to the blacklist.
   - 2 <URL> → Check if URL is blacklisted.

3. Checking Process:
   - If Bloom filter says "not present" → output false.
   - If Bloom filter says "maybe present", check the real blacklist:
     - If actually blacklisted → output true true.
     - If false positive → output true false.

4. Persistence:
   - The Bloom filter is saved to a binary file after every update.
   - On program startup, it loads the saved Bloom filter if available.

---

# Example Input
a  
8 1 2  
2 www.example.com0  
false  
x  
1 www.example.com0  
2 www.example.com0  
true true  
2 www.example.com1  
false  
2 www.example.com11  
true false  

---

# Example Output
false  
true true  
false  
true false  

---

# Application Screenshots

Starting the Application  
![image](https://github.com/user-attachments/assets/8079f943-5acd-4290-a005-4270ecf682c6)

Adding and Checking URLs  
![image](https://github.com/user-attachments/assets/9db1aac7-ad65-4efa-bbd2-41fb323da843)

---

# Project Structure
![image](https://github.com/user-attachments/assets/73db929f-1e5c-43c7-be8b-a843be9b3e6a)



---

# Notes

- std::hash behavior might differ between platforms (as warned in the task description).
- The application handles invalid inputs by ignoring them.
- The Bloom filter supports configuration for the number and type of hash functions.
- The project is designed for future extensions and changes, following SOLID and loose coupling principles.

---

# 🎓✅ Developed as part of the "Advanced Programming Systems" course at Bar Ilan University

