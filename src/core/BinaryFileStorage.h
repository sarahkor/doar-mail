#ifndef BINARY_FILE_STORAGE_H
#define BINARY_FILE_STORAGE_H
#include "IBloomFilterStorage.h"
#include <string>
#include <vector>

// This class implements the IBloomFilterStorage interface
// It allows loading/saving the Bloom filter state from/to a binary file
class BinaryFileStorage : public IBloomFilterStorage {
private:
    // The path to the binary file where the Bloom filter is stored
    std::string m_path;
    // Expected number of bytes
    size_t m_expectedSize = 0;

public:
    // Constructor that receives the path to the file
    explicit BinaryFileStorage(const std::string& path);
    
    // A function designed for tests
    // Sets the size to load/save
    void setExpectedSize(size_t expectedSize) override;

    // Loads bit data from the binary file into the provided vector
    bool load(std::vector<unsigned char>& bits) override;
    // Saves bit data from the vector to the binary file (to be implemented later)
    bool save(const std::vector<unsigned char>& bits) override;
};
#endif
