# URL Filtering System Using Bloom Filter

This project implements a Bloom Filter-based URL filtering system  
as part of an assignment in the "Advanced Programming Systems" course.  
The system is designed to efficiently detect if a URL is blacklisted,  
while using minimal memory and allowing for fast checks.  
The application was developed using Test-Driven Development (TDD) methodology.

---

# 🧠 Project Overview
•⁠  ⁠Implemented a Bloom Filter that supports inserting and checking URLs.
•⁠  ⁠Used multiple hashing techniques (std::hash applied multiple times).
•⁠  ⁠Saved and loaded the Bloom Filter state from a binary file automatically.
•⁠  ⁠Supported false positives, but no false negatives.
•⁠  ⁠Input is received via standard input, and output is written to standard output.
•⁠  ⁠Carefully follows SOLID principles and supports future extension.

---

# How to Compile and Run App

### Tools nedded: 
•⁠  ⁠GCC or Clang with C++17 support (tested on GCC 13)
•⁠  ⁠CMake ≥ 3.20 —or just g++ if you use the one-liner below

### Compile and Run the Application (Locally)

Compile:
g++ -std=c++17 -I src src/main.cpp src/main/app/.cpp src/main/commands/.cpp src/core/*.cpp -o app.exe

Run the Application:
./app.exe

---

# How to Run Unit Tests

### Tools nedded: 
•⁠  ⁠same compiler tool-chain as above (C++17)
•⁠  ⁠GoogleTest 

### Compile Unit Tests (Locally)

Compile the unit tests:
g++ -std=c++17 -I src src/tests/bloom_hash_tests/.cpp src/tests/storage_test/.cpp src/tests/commands_tests/.cpp src/main/commands/.cpp src/core/.cpp src/main/app/.cpp src/main.cpp -o tests

Run the unit tests:
./tests

---

# How to Run Using Docker
### Tools nedded: 
•⁠  ⁠Docker Engine ≥ 20.10
•⁠  ⁠CMake ≥ Windows users: WSL 2 or Git Bash to execute script.sh
•⁠  ⁠please make sure your Docker desktop is running

### Build the Docker Image, build volume and run: (after that you will be in a container)
./script.sh  (Windows users can do this commands instead installing Git Bash:
 1. docker build -f Dockerfile.app -t gmail_app .
 2. docker volume create bloomdata  
 3. docker run -it -v bloomdata:/app/data gmail_app bash )

### Run the Application inside the container
./build/app

### Run the tests inside the container
./build/tests

### Exit the Application:
Ctrl + c / Ctrl + z

### Exit the container:
Ctrl + d / Ctrl + P then Ctrl + Q

### Remove the image (if needed):
docker rm gmail_app

### Delete data:
Exit the application (Ctrl + c / Ctrl + z), cd data, rm urlsdata.txt, rm bloomfilterdata.bin, cd .. 
(after that it is posible to run ./build/app again without the data that was enterd in the previos run)
o.w the data will be kept because it is inside a volume

### Re-run without rebuilding
docker run -it -v bloomdata:/app/data gmail_app bash

### Data persistance:
the data will be kept even after deleting the container and the image, you can exit the container and image, delete them  
make the run command again and the data will persiste, the only way the data can be deleted is manually
---

# 🧩 How It Works
1.⁠ ⁠Initialization:
   - User specifies the Bloom filter size and hash function configuration.

2.⁠ ⁠Commands:
   - 1 <URL> → Add URL to the blacklist.
   - 2 <URL> → Check if URL is blacklisted.

3.⁠ ⁠Checking Process:
   - If Bloom filter says "not present" → output false.
   - If Bloom filter says "maybe present", check the real blacklist:
     - If actually blacklisted → output true true.
     - If false positive → output true false.

4.⁠ ⁠Persistence:
   - The Bloom filter is saved to a binary file after every update.
   - On program startup, it loads the saved Bloom filter if available.

5.⁠ ⁠App flow: 
   - the program ignores all inputs until the bloom filter setup is inputed (e.g 8 1 2) even if correct commands (1 [URL] or 2 [URL])are inputed. 
   - once the bloom filter setup is inputed the program ignores all inputs that are not 1 [URL] or 2 [URL]'
   - please notice that if the url inputed is not in a valid url format the program will ignore it
   - the commands are not sensitive to spacec so command such as: 8  1    2 or 1    www.example.com are valid


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

Running the tests

<img src="https://github.com/user-attachments/assets/bdc98778-9eb0-49d1-a416-edfedc325460" width="400"/>
---

# Project Structure
![image](https://github.com/user-attachments/assets/6b50be83-358f-4d41-9e06-5dffe97738ad)


---

# Notes

•⁠  ⁠std::hash behavior might differ between platforms (as warned in the task description).
•⁠  ⁠The application handles invalid inputs by ignoring them.
•⁠  ⁠The Bloom filter supports configuration for the number and type of hash functions.
•⁠  ⁠The project is designed for future extensions and changes, following SOLID and loose coupling principles.

---

# 🎓✅ Developed as part of the "Advanced Programming Systems" course at Bar Ilan University
