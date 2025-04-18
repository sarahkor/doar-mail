#include "BloomFilter.h"
#include <stdexcept>



// Constructor: initializes the bit array to the given size (all false- zero) 
// and stores the list of hash functions to use.
BloomFilter::BloomFilter(size_t size, const std::vector<std::shared_ptr<IHashFunction>>& functions)
    : bitArray(size, false), hashFunctions(functions) {
    if (hashFunctions.empty()) {
        throw std::invalid_argument("BloomFilter requires at least one hash function.");
    }
}



// Adds a URL to the Bloom filter by hashing it with each hash function
// and setting the corresponding bits in the bit array to true.    
void BloomFilter::add(const std::string& url) {
    for (const auto& hashFunc : hashFunctions) {
        size_t hashValue = hashFunc->hash(url);
        size_t index = hashValue % bitArray.size();
        bitArray[index] = true;
    }
}


//Checks whether a URL might be in the Bloom filter.
// Returns true if all bits for the hashed values are set,
// false if any of them are unset (definitely not in the set).
bool BloomFilter::contains(const std::string& url) const {
    for (const auto& hashFunc : hashFunctions) {
        size_t hashValue = hashFunc->hash(url);
        size_t index = hashValue % bitArray.size();
        if (!bitArray[index]) {
            return false; // definitely NOT in the set
        }
    }
    return true; 
}


