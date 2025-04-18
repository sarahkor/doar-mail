#pragma once

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


public:
    // constructor- If no storage is sent, the storage will receive a default value (nullptr)
    // and we will not be able to load/save.
    BloomFilter(size_t size,
                const std::vector<std::shared_ptr<IHashFunction>>& functions,
                std::unique_ptr<IBloomFilterStorage> storage = nullptr);

    // Add a URL to the filter
    void add(const std::string& url);

    // Check if URL might be in the filter
    bool contains(const std::string& url) const;

};
