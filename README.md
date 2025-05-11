# URL Filtering System Using Bloom Filter

This project implements a TCP-based URL filtering system using a Bloom Filter.  
It was developed for the "Advanced Programming Systems" course at Bar-Ilan University  
as part of Assignment 2, which required transforming a standalone CLI tool into  
a client-server architecture over sockets using C++ (server) and Python (client).

---

# 🧠 Project Overview
- Server handles all business logic, I/O over sockets (no console I/O).
- Client sends commands and prints results — clients are intentionally “dumb.”
- Bloom Filter supports insertions, checks, deletions with persistent data.
- Status messages are returned in HTTP-style format (`201 Created`, etc.).
- SOLID principles followed — system is open for extension and closed for modification.

## 💻 Supported Commands (via Client)

| Command              | Server Response        | Meaning                          |
|----------------------|------------------------|----------------------------------|
| `POST <url>`         | `201 Created`          | URL added to Bloom Filter        |
| `GET <url>`          | `200 Ok\n\n false`     | URL is not balcklisted           |
| `GET <url>`          | `200 Ok\n\n true true` | URL is balcklisted               |
| `GET <url>`          | `200 Ok\n\n true false`| URL is not balcklisted           |
| `DELETE <url>`       | `204 No Content`       | URL deleted from file only       |
| `DELETE <not_found>` | `404 Not Found`        | URL was not in the file          |
| Invalid command      | `400 Bad Request`      | Format not recognized            |

> Commands and responses are terminated by `\\n`.  
> Invalid URLs or formats are ignored with `400 Bad Request`.

# How to Run Using Docker

### Tools nedded: 
- ⁠ ⁠Docker Engine ≥ 20.10
-  ⁠please make sure your Docker desktop is running

###  Step 1: Build Docker images for server (with volume and network), client, and tests and run the server container 

```bash
./script.sh
```

after that you will be inside the server container

### Step 2 (Optional): inside the container, run the tests:

``` bash
  ./build/tests
  ```
after that you will stay in the container and you can run the server.

### Step 3: inside the container, run the server manually using:

Usage:
  ./build/server <port> <size> <seed1> [<seed2> ... <seedN>]

Arguments:
  <port>     → Port number the server will listen on (must be between 1024 and 65535)
  <size>     → Bloom filter size (must be positive integer)
  <seed1>    → At least one integer seed for a hash function (must be positive integer)
  [<seed2> ... <seedN>] → Optional additional integer seeds for more hash functions

Description:
  - The port number must be a valid TCP port in the range 1024–65535.
  - You must provide at least one hash function seed, but you may provide as many as you like.
  - All arguments must be valid positive integers.
  - If the arguments are missing or invalid, the server will not start.

Example:

  ``` bash
  ./build/server 12345 8 1 2
  ```

Each seed will be used to configure a distinct hash function in the Bloom filter.

### Step 4: Run the client container

 **Open a second terminal window.**
 This command starts an interactive bash shell inside the client container:

```bash
  docker run -it --rm \
  --network=gmailnet \
  -v gmaildata:/server/data \
  --entrypoint bash \
  gmail_client
  ```

Now inside the container, run the Python client script:
 
python client.py server-container \<port\>

Example:

``` bash
python client.py server-container 12345
```

After this, you can start typing commands such as:

POST www.example.com
 
GET www.example.com

DELETE www.example.com

###  Step 5: (Optional) Inspect the persistent data in the volume
go to the server terminal exit the cotainer (Ctrl + c ) go to the data dir (cd data) then type: cat urlsdata.txt, then type cd .. and after that you can run the server again (./build/server 12345 8 1 2)

### exit the server and container:

to exit the server press: Ctrl + c 

**re-run the server inside the container (after exiting it):**

``` bash
  ./build/server 12345 8 1 2
  ```
You can change the arguments as needed: <port> <bloom-size> <seed1>[<seed2> ...]

to exit the server container press: Ctrl + d

**re- running the server container (after exiting it):**
after exititing the server container and you want to re-run do:

``` bash
docker run -it --name server-container  --network gmailnet -v gmaildata:/server/data gmail_server bash
```

### Delete data:
Exit the container (Ctrl + c / Ctrl + z), cd data, rm urlsdata.txt, rm bloomfilterdata.bin, cd .. 
o.w the data will be kept because it is inside a volume

### Data persistance:
the data will be kept even after deleting the container and the image, you can exit the container and image, delete them  
make the run command again and the data will persiste, the only way the data can be deleted is manually

## 🔁 Example Session
![image](https://github.com/user-attachments/assets/dfed6ad9-be17-43c5-9c53-bbdcb30648e2)
---

## Questions:

1. Did the fact that the names of the commands changed required you to touch the code that should be "closed
   to changes but open to expansion"? 
   no, we used a polymorphic commands map, allowing us to simply change the keys associated with each command without modifying the internal logic of the command classes themselves.

2. Did the fact that new commands were added require you to touch the code that should be "closed
   to changes but open to expansion"?
   yes and no.
   no, because we used the command desine pattern which allowed us to add a new command class and to add it to the command map without modifying existing command logic. 
   yes, because in an previous task we used a vector to store the blacklist, which made deletions inefficient. we changed it to a set, which required  us touch some of the code that should be "closed to changes but open to expansion".

3. Did the fact that the command output changed require you to touch the code that should be "closed
   to changes but open to expansion"?
   No, Since we used polymorphic ICommand interface, we could just locally modify the implementation of the commands that needed to be changed, without any bigger API changes.

4. Did the fact that the input and output came from sockets instead of the command line require you to touch the code that
   should be "closed to changes but open to expansion"?
   Yes. We had to change the execute() method signature in the ICommand interface to return a std::string instead of void. This change was necessary to redirect command output through the socket to the client. While this impacted all implementations, it was a minimal, localized change that improved the overall design by unifying output handling.

### Summary:
Input/output was moved from stdin/stdout to sockets
 This was done without modifying any core logic in the system

#POST / GET / DELETE commands were added
 A lightweight parser maps them to the existing internal logic
 Instead of returning true/false, the server now returns HTTP-style status codes
 For example: "201 Created", "204 No Content", "400 Bad Request", etc.
 
 The system is designed for future extension:
 It currently supports a single client
 But it can be extended to support multiple concurrent clients with minor changes

 This shows that the system follows SOLID principles:
 It is open to extension, but closed to modification


# 📌 Notes

- The system currently supports a single client connection
- You can easily extend the server to support multiple clients using threads or select()
 - Command names and output were adapted to match assignment spec
 - The code is clean, modular, and separated into .cpp and .h files
 - No external libraries are used except:
  - GoogleTest (C++) for testing
  - Standard libraries in Python for the client

## Run the code locally:
For faster development iteration, you can also run the code directly on your Linux/WSL machine: 

### Tools needed:
- g++ (C++ compiler with C++17 support)
- python3 (Python 3 interpreter)

### step 1:
in a terminal window:
compile (assuming the compilation is from root (create-our-gmail)):

``` bash
g++ -std=c++17 -I src src/main.cpp src/main/app/*.cpp src/main/commands/*.cpp src/utils/*.cpp src/server/*.cpp src/core/*.cpp -o server.exe
```

run: 
./server.exe <port> <bloom-size> <seed1> [<seed2> ... <seedN>]

for example:

``` bash
./server.exe 12345 8 1 2
```
the arguments can be anything that meets this requuirements:
<port>     → Port number the server will listen on (must be between 1024 and 65535)
<size>     → Bloom filter size (must be positive integer)
<seed1>    → At least one integer seed for a hash function (must be positive integer)
<seed2> ... <seedN>] → Optional additional integer seeds for more hash functions

### step 2: 
in a seconde teminal window:
run the client (assuming the compilation is from root (create-our-gmail)):

 python3 src/client/client.py <ip> <port>

 for example:

 ``` bash 
 python3 src/client/client.py 127.0.0.1 12345
 ```
please notice: the port must be the same as the server port

###  🎓 Course Information

 Bar-Ilan University
 
 "Advanced Programming Systems" course
 
Assignment 2 — TCP Client/Server with Bloom Filter

Year: 2025

