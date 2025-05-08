#ifndef BLOOM_FILTER_H
#define BLOOM_FILTER_H
#include <string>
#include <vector>
#include <memory>
#include "IHashFunction.h"
#include "IBloomFilterStorage.h"


class BloomFilter {
private:
    std::vector<bool> bitArray; // internal bit array
    std::vector<std::shared_ptr<IHashFunction>> hashFunctions; // flexible hash system
    // A pointer that holds the storage mechanism
    // The pointer owns an object that implements the IBloomFilterStorage interface.
    // It allows BloomFilter to load and save its bit array via that object.
    std::unique_ptr<IBloomFilterStorage> m_storage;
    std::vector<unsigned char> m_bits;
    // Flag "there was an update" (add)
    bool m_dirty = false;

public:
    // constructor- If no storage is sent, the storage will receive a default value (nullptr)
    // and we will not be able to load/save.
    BloomFilter(size_t size,
                const std::vector<std::shared_ptr<IHashFunction>>& functions,
                std::unique_ptr<IBloomFilterStorage> storage = nullptr);
    // destructor
    ~BloomFilter(); 
    // Add a URL to the filter
    void add(const std::string& url);
    // Check if URL might be in the filter
    bool contains(const std::string& url) const;

    // A function designed for tests
    // Get pointer to storage (e.g. for testing)
    IBloomFilterStorage* getStorage() const;
    // A function designed for tests
    // Get the current bit array
    std::vector<unsigned char> getBitArray() const;
    // A function designed for tests
    // Set the bit array
    void setBitArray(const std::vector<unsigned char>& bits);
};
#endif
