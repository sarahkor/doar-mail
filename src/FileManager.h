#ifndef FILE_MANAGER_H
#define FILE_MANAGER_H

#include <string>
#include <vector>

class FileManager {
public:
    // Load the Bloom Filter bit array from a binary file.
    // If the file does not exist or is corrupt – initialize a new array in its place, and write a log explaining what happened.
    bool loadFromFile(const std::string& filepath, std::vector<bool>& bitArray, size_t expectedSize);

private:
    // Prints a log message to the screen (console), so you know what happened while the system tried to load the file.
    void logResult(const std::string& message);
};

#endif
