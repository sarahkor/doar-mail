#ifndef IBLOOM_FILTER_STORAGE_H
#define IBLOOM_FILTER_STORAGE_H
#include <vector>
#include <string>

 // Interface for Bloom filter storage mechanism.
 // Defines how to load and save the bit array from/to persistent storage.
class IBloomFilterStorage {
public:
    // Loads the Bloom filter bit array from persistent storage.
    // return true if loading was successful, false otherwise.
    virtual bool load(std::vector<unsigned char>& bits) = 0;

    // Saves the Bloom filter bit array to persistent storage.
    // return true if saving was successful, false otherwise.
    virtual bool save(const std::vector<unsigned char>& bits) = 0;

    virtual void setExpectedSize(size_t expectedSize) = 0;

    virtual ~IBloomFilterStorage() = default;
};
#endif