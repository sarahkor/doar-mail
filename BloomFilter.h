#pragma once

#include <string>
#include <vector>
#include <memory>
#include "IHashFunction.h"

class BloomFilter {
private:
    std::vector<bool> bitArray; // internal bit array
    std::vector<std::shared_ptr<IHashFunction>> hashFunctions; // flexible hash system

public:
    // Constructor
    BloomFilter(size_t size, const std::vector<std::shared_ptr<IHashFunction>>& functions);

    // Add a URL to the filter
    void add(const std::string& url);

    // Check if URL might be in the filter
    bool contains(const std::string& url) const;

};
