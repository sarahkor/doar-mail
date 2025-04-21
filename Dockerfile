FROM gcc:latest

# Install required packages
RUN apt-get update && apt-get install -y \
    cmake \
    git \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy the entire project
COPY . .

# Create build directory
RUN mkdir -p build
WORKDIR /app/build

# Build the project
RUN cmake .. && make

# Command to run the tests
CMD ["./src/tests/storage_test/storage_tests"]