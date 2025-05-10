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

| Command              | Server Response      | Meaning                          |
|----------------------|----------------------|----------------------------------|
| `POST <url>`         | `201 Created`        | URL added to Bloom Filter        |
| `GET <url>`          | `200 Ok`             | URL might be blacklisted         |
| `DELETE <url>`       | `204 No Content`     | URL deleted from file only       |
| `DELETE <not_found>` | `404 Not Found`      | URL was not in the file          |
| Invalid command      | `400 Bad Request`    | Format not recognized            |

> Commands and responses are terminated by `\\n`.  
> Invalid URLs or formats are ignored with `400 Bad Request`.

# How to Run Using Docker

### Tools nedded: 
•⁠  ⁠Docker Engine ≥ 20.10

•⁠  ⁠CMake ≥ Windows users: WSL 2 or Git Bash to execute script.sh

•⁠  ⁠please make sure your Docker desktop is running

###  Step 1: Build Docker images for server, client, and tests

docker build -f Dockerfile.server -t gmail_server .

docker build -f src/client/Dockerfile.client -t gmail_client src/client

docker build -f Dockerfile.tests -t gmail_tests .

###  Step 2: Create a shared Docker network and volume (if they don’t already exist)

docker network inspect gmail_net >/dev/null 2>&1 || docker network create gmail_net

docker volume inspect bloomdata >/dev/null 2>&1 || docker volume create bloomdata

### Step 3: Run the server container

 Open your first terminal window.
This command launches a bash shell inside the server container.

docker run -it --rm \
  --network=gmail_net \
  --name server \
  -v bloomdata:/server/data \
  gmail_server

 Now inside the container, run the server manually using:
 
./build/server \<port\> \<size\> \<seed1\> \<seed2\> \<seed3\>

 Replace:
 \<port\>   → Port number the server will listen on (e.g. 12345)
 
\<size\>  → Bloom filter size (e.g. 1000)

 \<seed1\> \<seed2\> \<seed3\> → Hash function seeds (e.g. 3 5 7)

Example:
./build/server 12345 1000 3 5 7


### Step 4: Run the client container

 Open a second terminal window.
 This command starts an interactive bash shell inside the client container:

docker run -it --rm \
  --network=gmail_net \
  -v bloomdata:/server/data \
  --entrypoint bash \
  gmail_client

 Now inside the container, run the Python client script:
 
python client.py server \<port\>

 Example:
python client.py server 12345

After this, you can start typing commands such as:

 POST http://example.com
 
GET http://example.com

DELETE http://example.com


###  Step 5: (Optional) Inspect the persistent data in the volume
docker run -it --rm -v bloomdata:/server/data alpine sh -c "ls /server/data && cat /server/data/urlsdata.txt"

###  Step 6: (Optional) Run all tests
docker run -it --rm gmail_tests


### Delete data:
Exit the application (Ctrl + c / Ctrl + z), cd data, rm urlsdata.txt, rm bloomfilterdata.bin, cd .. 
(after that it is posible to run ./build/app again without the data that was enterd in the previos run)
o.w the data will be kept because it is inside a volume

### Data persistance:
the data will be kept even after deleting the container and the image, you can exit the container and image, delete them  
make the run command again and the data will persiste, the only way the data can be deleted is manually

## 🔁 Example Session
![image](https://github.com/user-attachments/assets/dfed6ad9-be17-43c5-9c53-bbdcb30648e2)
---

# 🔧 Design for Extensibility

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


# 📌 Open/Closed Principle Reflections

 These answers refer to how we handled changes in this assignment
 and whether they required modifying code that should be closed to change.

### 🔄 Did changing the command names (e.g. from 1/2 to POST/GET) require touching closed code?
 No. The parser is designed to map strings like "POST" or "GET" to internal operations.
 The logic for execution remains untouched. This shows that the command execution code
 is closed for modification but open for extension via new command strings.

 ### ➕ Did adding new commands (e.g. DELETE) require modifying closed code?
 No. The system was designed with a command interface. We added a new command class
 that implements the interface. The existing logic did not need to change.
This confirms extensibility was preserved from Assignment 1.

###  🧾 Did changing the output format (from 'true'/'false' to status codes) require modifying closed code?
 Partially. We encapsulated response formatting in one layer only.
 The change did not propagate through the system, so the core logic was untouched.
We refactored early to isolate output formatting, so future changes won't affect business logic.

###  🔁 Did changing input/output from console to sockets require modifying closed code?
 No. The I/O layer was already separated from the logic in Assignment 1.
 We swapped out standard input/output for socket read/write at the outermost level.
 This validates that I/O is an interchangeable component in our design.

### ✅ Summary:
 Our original design from Assignment 1 already followed SOLID principles.
 That allowed us to extend the system in Assignment 2 with:
 - New commands
 - New I/O mechanism (sockets)
- New output format
 Without modifying internal logic.

The code is closed for modification but open for extension.


# 📌 Notes

- The system currently supports a single client connection
- You can easily extend the server to support multiple clients using threads or select()
 - Command names and output were adapted to match assignment spec
 - The code is clean, modular, and separated into .cpp and .h files
 - No external libraries are used except:
  - GoogleTest (C++) for testing
  - Standard libraries in Python for the client

###  🎓 Course Information

 Bar-Ilan University
 
 "Advanced Programming Systems" course
 
Assignment 2 — TCP Client/Server with Bloom Filter

Year: 2025

