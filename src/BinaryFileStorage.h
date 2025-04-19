#pragma once

#include "IBloomFilterStorage.h"
#include <string>
#include <vector>

// This class implements the IBloomFilterStorage interface
// It allows loading/saving the Bloom filter state from/to a binary file
class BinaryFileStorage : public IBloomFilterStorage {
private:
    // The path to the binary file where the Bloom filter is stored
    std::string m_path;

public:
    // Constructor that receives the path to the file
    explicit BinaryFileStorage(const std::string& path);
    
    // Loads bit data from the binary file into the provided vector
    bool load(std::vector<unsigned char>& bits) override;
    // Saves bit data from the vector to the binary file (to be implemented later)
    bool save(const std::vector<unsigned char>& bits) override;
};
