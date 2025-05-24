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
      m_storage(std::move(storage)) {
    // Initialize m_bits with the same size as bitArray
    m_bits.resize(size, 0);
    if (m_storage) {
        // Ensure file size matches bit array size
        m_storage->setExpectedSize(size);
        // Load from disk and update bitArray
        if (m_storage->load(m_bits)) {
            setBitArray(m_bits);
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
        m_bits[index] = 1;
    
    }
    // Only try to save if we have storage
    if (m_storage) {
        //Flag "there was an update" = 1
        m_dirty = true;
        m_storage->save(m_bits);
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
            return false;
        }
    }
    return true;
}

// Get pointer to storage (e.g. for testing)
IBloomFilterStorage* BloomFilter::getStorage() const {
    if (!m_storage) {
        // Static dummy storage that safely fails any load/save calls
        static struct NullStorage : IBloomFilterStorage {
            bool load(std::vector<unsigned char>&) override { return false; }
            bool save(const std::vector<unsigned char>&) override { return false; }
            void setExpectedSize(size_t) override { /* no-op */ }
        } nullStorage;
        return &nullStorage;
    }
    return m_storage.get();
}

// Returns the current bit array as unsigned char
vector<unsigned char> BloomFilter::getBitArray() const {
    return m_bits;
}

// Receives a bit array and converts it to an internal boolean
void BloomFilter::setBitArray(const vector<unsigned char>& bits) {
    if (bits.size() != bitArray.size()) {
        return;
    }
    
    m_bits = bits;
    for (size_t i = 0; i < bits.size(); ++i) {
        bitArray[i] = (bits[i] != 0);
    }
}
// destructor
// This way even if add() was NOT called the changes will be saved
BloomFilter::~BloomFilter() {
    // We will only save if any add() occurred
    if (m_storage && m_dirty) {
        m_storage->save(m_bits);
    }
}

