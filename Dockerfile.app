FROM gcc:13

# Install required packages
RUN apt-get update && apt-get install -y cmake git && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy project files
COPY . .

# Create and move into build directory
RUN mkdir -p build
WORKDIR /app/build

RUN rm -rf /app/build/*

# Build the whole project (library + tests + app)
RUN cmake .. && make

WORKDIR /app

# Set the default command to run the application
CMD ["./build/app"] 
