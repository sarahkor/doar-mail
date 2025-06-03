# Step 1: Use a minimal Python 3
FROM python:3

# Step 2: Set the working directory inside the container
WORKDIR /client

# Step 3: Copy the client script into the container
COPY . /client

# Step 4: Set the default command to run the client script
# Note: This requires two arguments at runtime: <server_ip> and <server_port>
ENTRYPOINT ["python", "client.py"]


