#include "BloomFilter.h"
#include <utility>
#include <memory>
#include <vector>

using namespace std;

// Constructor: initializes the bit array to the given size (all false- zero) 
// and stores the list of hash functions to use.
BloomFilter::BloomFilter(size_t size,
                        const std::vector<std::shared_ptr<IHashFunction>>& functions,
                        unique_ptr<IBloomFilterStorage> storage)
    : bitArray(size, false),
      hashFunctions(functions),
      m_storage(std::move(storage)) { // Move ownership of the storage object into the class member.
        // If a storage mechanism was provided, attempt to load existing filter data from it.
        if (m_storage) {
            // Temporary byte buffer to hold the raw binary contents loaded from the file (or other source).
            vector<unsigned char> rawBits;

            // Try to load the raw bit data from the storage.
            // Only proceed if the load was successful AND the loaded size matches the expected filter size.
            if (m_storage->load(rawBits) && rawBits.size() == bitArray.size()) {
                // Convert each byte in rawBits to a boolean value in bitArray.
                for (size_t i = 0; i < rawBits.size(); ++i)
                    bitArray[i] = (rawBits[i] != 0);
            }

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


