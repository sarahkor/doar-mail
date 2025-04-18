#include "FileManager.h"
#include <fstream>
#include <iostream>

// Load the Bloom Filter bit array from a binary file.
// If the file does not exist or is corrupt – initialize a new array in its place, and write a log explaining what happened.
bool FileManager::loadFromFile(const std::string& filepath, std::vector<bool>& bitArray, size_t expectedSize) {
    // Opening the file
    std::ifstream inFile(filepath, std::ios::binary);
    
    // If there is no file
    if (!inFile) {
        logResult("File not found: initializing fresh Bloom Filter.");
        bitArray = std::vector<bool>(expectedSize, false);
        return false;
    }
    // Reads the entire contents of the file into a buffer as a vector of char
    std::vector<char> buffer((std::istreambuf_iterator<char>(inFile)),
                             std::istreambuf_iterator<char>());
    inFile.close();
    // Checks if the file size does not match what we expected (damaged or out of date)
    if (buffer.size() != expectedSize) {
        logResult("Corrupted file (wrong size): initializing fresh Bloom Filter.");
        bitArray = std::vector<bool>(expectedSize, false);
        return false;
    }
    // Clears the current bit array to load new data
    bitArray.clear();
    // A loop that converts each char in a file to a true/false value
    for (size_t i = 0; i < expectedSize; ++i) {
        bitArray.push_back(buffer[i] != 0);
    }
    return true;
}

// Prints a log message to the screen (console), so you know what happened while the system tried to load the file.
void FileManager::logResult(const std::string& message) {
    std::cout << "[FileManager] " << message << std::endl;
}
