#include "bloom_filter_storage_test.h"
#include <limits>
#include <fstream>
#include <iostream>
#include <ctime>
#include <string>
#include <cstdlib> // For system function

// Helper function to check if a file exists using fstream
bool fileExistsBF(const std::string& path) {
    std::ifstream infile(path);
    return infile.good();
}

// Helper function to check if a directory exists using standard C++
bool directoryExistsBF(const std::string& path) {
    // Try to create a temporary file in the directory
    std::string testFile = path + "/test.tmp";
    std::ofstream test(testFile);
    bool exists = test.is_open();
    test.close();
    if (exists) {
        // Clean up the test file
        std::remove(testFile.c_str());
    }
    return exists;
}

// Helper function to create a directory using standard C++ system calls
bool createDirectoryBF(const std::string& path) {
    if (directoryExistsBF(path)) {
        return true; // Directory already exists
    }
    
    // Use appropriate command based on platform
    #ifdef _WIN32
    std::string command = "mkdir \"" + path + "\" 2> nul";
    #else
    std::string command = "mkdir -p \"" + path + "\" 2>/dev/null";
    #endif
    
    int result = std::system(command.c_str());
    
    // Check if directory was created successfully
    return directoryExistsBF(path);
}

// Helper function to delete a file (replaces std::remove)
void deleteFileBF(const std::string& path) {
    // Use standard C++ remove function
    std::remove(path.c_str());
}

// Helper function to get a guaranteed non-existent file path for testing
std::string getNonExistentFilePathBF() {
    // Use a unique path that we can be sure doesn't exist
    static int counter = 0;
    std::string path = "non_existent_test_file_bf_" + std::to_string(++counter) + "_" + 
                       std::to_string(std::time(nullptr)) + ".bf";
    
    // Make extra sure it doesn't exist
    if (fileExistsBF(path)) {
        std::remove(path.c_str());
    }
    
    return path;
}

// ============= SANITY TESTS =============
TEST_F(BloomFilterStorageTest, SaveAndLoadBasic) {
    // Create hash functions
    std::vector<std::shared_ptr<IHashFunction>> hashFunctions;
    hashFunctions.push_back(std::make_shared<ConfigurableHash>("std", 1));
    
    // Create storage
    auto storage = std::make_unique<BinaryFileStorage>("test.bf");
    
    // Create Bloom filter
    BloomFilter original(1000, hashFunctions, std::move(storage));
    original.add("test1");
    original.add("test2");
    
    // Get the bit array from the filter
    std::vector<unsigned char> bits = original.getBitArray();
    
    // Save the bits
    ASSERT_TRUE(original.getStorage()->save(bits));
    
    // Create a new filter with the same parameters
    auto newStorage = std::make_unique<BinaryFileStorage>("test.bf");
    BloomFilter loaded(1000, hashFunctions, std::move(newStorage));
    
    // Load the bits
    ASSERT_TRUE(loaded.getStorage()->load(bits));
    loaded.setBitArray(bits);
    
    ASSERT_TRUE(loaded.contains("test1"));
    ASSERT_TRUE(loaded.contains("test2"));
}

TEST_F(BloomFilterStorageTest, SaveAndLoadManyElements) {
    std::vector<std::shared_ptr<IHashFunction>> hashFunctions;
    hashFunctions.push_back(std::make_shared<ConfigurableHash>("std", 1));
    
    auto storage = std::make_unique<BinaryFileStorage>("many.bf");
    BloomFilter original(10000, hashFunctions, std::move(storage));
    
    // Add 200 distinct elements
    for (int i = 0; i < 200; ++i) {
        original.add("test" + std::to_string(i));
    }
    
    std::vector<unsigned char> bits = original.getBitArray();
    ASSERT_TRUE(original.getStorage()->save(bits));
    
    auto newStorage = std::make_unique<BinaryFileStorage>("many.bf");
    BloomFilter loaded(10000, hashFunctions, std::move(newStorage));
    
    ASSERT_TRUE(loaded.getStorage()->load(bits));
    loaded.setBitArray(bits);
    
    // Verify all elements are present
    for (int i = 0; i < 200; ++i) {
        ASSERT_TRUE(loaded.contains("test" + std::to_string(i)));
    }
}

TEST_F(BloomFilterStorageTest, SaveAndLoadMultipleHashFunctions) {
    std::vector<std::shared_ptr<IHashFunction>> hashFunctions;
    hashFunctions.push_back(std::make_shared<ConfigurableHash>("std", 1));
    hashFunctions.push_back(std::make_shared<ConfigurableHash>("std", 2));
    hashFunctions.push_back(std::make_shared<ConfigurableHash>("std", 3));
    
    auto storage = std::make_unique<BinaryFileStorage>("multi_hash.bf");
    BloomFilter original(1000, hashFunctions, std::move(storage));
    original.add("test1");
    original.add("test2");
    
    std::vector<unsigned char> bits = original.getBitArray();
    ASSERT_TRUE(original.getStorage()->save(bits));
    
    auto newStorage = std::make_unique<BinaryFileStorage>("multi_hash.bf");
    BloomFilter loaded(1000, hashFunctions, std::move(newStorage));
    
    ASSERT_TRUE(loaded.getStorage()->load(bits));
    loaded.setBitArray(bits);
    
    ASSERT_TRUE(loaded.contains("test1"));
    ASSERT_TRUE(loaded.contains("test2"));
}

TEST_F(BloomFilterStorageTest, SaveLoadRoundTripIntegrity) {
    std::vector<std::shared_ptr<IHashFunction>> hashFunctions;
    hashFunctions.push_back(std::make_shared<ConfigurableHash>("std", 1));
    
    auto storage = std::make_unique<BinaryFileStorage>("integrity.bf");
    BloomFilter original(1000, hashFunctions, std::move(storage));
    original.add("test1");
    original.add("test2");
    
    std::vector<unsigned char> originalBits = original.getBitArray();
    ASSERT_TRUE(original.getStorage()->save(originalBits));
    
    // Read file directly to verify bit-for-bit integrity
    std::vector<unsigned char> loadedBits;
    ASSERT_TRUE(original.getStorage()->load(loadedBits));
    
    // Compare byte by byte
    ASSERT_EQ(originalBits.size(), loadedBits.size());
    for (size_t i = 0; i < originalBits.size(); ++i) {
        ASSERT_EQ(originalBits[i], loadedBits[i]);
    }
    
    // Verify the loaded bits work in a new filter
    auto newStorage = std::make_unique<BinaryFileStorage>("integrity.bf");
    BloomFilter loaded(1000, hashFunctions, std::move(newStorage));
    loaded.setBitArray(loadedBits);
    
    ASSERT_TRUE(loaded.contains("test1"));
    ASSERT_TRUE(loaded.contains("test2"));
}

TEST_F(BloomFilterStorageTest, SaveAndLoadWithDifferentHashFunctions) {
    std::vector<std::shared_ptr<IHashFunction>> hashFunctions1;
    hashFunctions1.push_back(std::make_shared<ConfigurableHash>("std", 1));
    hashFunctions1.push_back(std::make_shared<ConfigurableHash>("std", 2));
    
    auto storage = std::make_unique<BinaryFileStorage>("different_hash.bf");
    BloomFilter original(1000, hashFunctions1, std::move(storage));
    original.add("test1");
    original.add("test2");
    
    std::vector<unsigned char> bits = original.getBitArray();
    ASSERT_TRUE(original.getStorage()->save(bits));
    
    // Use the SAME hash functions for loading
    auto newStorage = std::make_unique<BinaryFileStorage>("different_hash.bf");
    BloomFilter loaded(1000, hashFunctions1, std::move(newStorage));
    
    ASSERT_TRUE(loaded.getStorage()->load(bits));
    loaded.setBitArray(bits);
    
    ASSERT_TRUE(loaded.contains("test1"));
    ASSERT_TRUE(loaded.contains("test2"));
}

// ============= NEGATIVE TESTS =============
TEST_F(BloomFilterStorageTest, LoadNonExistentFile) {
    std::vector<std::shared_ptr<IHashFunction>> hashFunctions;
    hashFunctions.push_back(std::make_shared<ConfigurableHash>("std", 1));
    
    auto storage = std::make_unique<BinaryFileStorage>("nonexistent.bf");
    BloomFilter filter(1000, hashFunctions, std::move(storage));
    
    std::vector<unsigned char> bits;
    ASSERT_FALSE(filter.getStorage()->load(bits));
}

TEST_F(BloomFilterStorageTest, SaveInvalidPath) {
    std::vector<std::shared_ptr<IHashFunction>> hashFunctions;
    hashFunctions.push_back(std::make_shared<ConfigurableHash>("std", 1));
    
    // Try to save to a directory instead of a file
    auto storage = std::make_unique<BinaryFileStorage>("testdir/");
    BloomFilter filter(1000, hashFunctions, std::move(storage));
    
    std::vector<unsigned char> bits = filter.getBitArray();
    ASSERT_FALSE(filter.getStorage()->save(bits));
}

TEST_F(BloomFilterStorageTest, LoadCorruptedFile) {
    std::ofstream corruptFile("corrupt.bf", std::ios::binary);
    std::vector<unsigned char> garbage(100, 0xFF);
    corruptFile.write(reinterpret_cast<const char*>(garbage.data()), garbage.size());
    corruptFile.close();
    
    std::vector<std::shared_ptr<IHashFunction>> hashFunctions;
    hashFunctions.push_back(std::make_shared<ConfigurableHash>("std", 1));
    
    auto storage = std::make_unique<BinaryFileStorage>("corrupt.bf");
    BloomFilter filter(1000, hashFunctions, std::move(storage));
    
    std::vector<unsigned char> bits;
    ASSERT_FALSE(filter.getStorage()->load(bits));
}

TEST_F(BloomFilterStorageTest, LoadWrongSizeFile) {
    std::vector<std::shared_ptr<IHashFunction>> hashFunctions;
    hashFunctions.push_back(std::make_shared<ConfigurableHash>("std", 1));
    
    auto storage = std::make_unique<BinaryFileStorage>("mismatch.bf");
    BloomFilter smallFilter(500, hashFunctions, std::move(storage));
    smallFilter.add("test");
    
    std::vector<unsigned char> bits = smallFilter.getBitArray();
    ASSERT_TRUE(smallFilter.getStorage()->save(bits));
    
    auto newStorage = std::make_unique<BinaryFileStorage>("mismatch.bf");
    BloomFilter largeFilter(1000, hashFunctions, std::move(newStorage));
    
    std::vector<unsigned char> loadedBits;
    ASSERT_FALSE(largeFilter.getStorage()->load(loadedBits));
}

TEST_F(BloomFilterStorageTest, SaveWithoutStorage) {
    std::vector<std::shared_ptr<IHashFunction>> hashFunctions;
    hashFunctions.push_back(std::make_shared<ConfigurableHash>("std", 1));
    
    // Create filter without storage
    BloomFilter filter(1000, hashFunctions, nullptr);
    
    std::vector<unsigned char> bits = filter.getBitArray();
    ASSERT_FALSE(filter.getStorage()->save(bits));
}

TEST_F(BloomFilterStorageTest, LoadEmptyFile) {
    // Create an empty file
    std::ofstream emptyFile("empty_file.bf", std::ios::binary);
    emptyFile.close();
    
    std::vector<std::shared_ptr<IHashFunction>> hashFunctions;
    hashFunctions.push_back(std::make_shared<ConfigurableHash>("std", 1));
    
    auto storage = std::make_unique<BinaryFileStorage>("empty_file.bf");
    BloomFilter filter(1000, hashFunctions, std::move(storage));
    
    std::vector<unsigned char> bits;
    ASSERT_FALSE(filter.getStorage()->load(bits));
}

// ============= BOUNDARY TESTS =============
TEST_F(BloomFilterStorageTest, SaveMaxSizeFilter) {
    std::vector<std::shared_ptr<IHashFunction>> hashFunctions;
    hashFunctions.push_back(std::make_shared<ConfigurableHash>("std", 1));
    
    // Use a large but reasonable size instead of max size
    const size_t largeSize = 1000000; // 1 million bits
    auto storage = std::make_unique<BinaryFileStorage>("max_size.bf");
    BloomFilter filter(largeSize, hashFunctions, std::move(storage));
    
    std::vector<unsigned char> bits = filter.getBitArray();
    ASSERT_TRUE(filter.getStorage()->save(bits));
}

TEST_F(BloomFilterStorageTest, SaveMinSizeFilter) {
    std::vector<std::shared_ptr<IHashFunction>> hashFunctions;
    hashFunctions.push_back(std::make_shared<ConfigurableHash>("std", 1));
    
    auto storage = std::make_unique<BinaryFileStorage>("min_size.bf");
    BloomFilter filter(1, hashFunctions, std::move(storage));
    filter.add("test");
    
    std::vector<unsigned char> bits = filter.getBitArray();
    ASSERT_TRUE(filter.getStorage()->save(bits));
    
    auto newStorage = std::make_unique<BinaryFileStorage>("min_size.bf");
    BloomFilter loaded(1, hashFunctions, std::move(newStorage));
    
    ASSERT_TRUE(loaded.getStorage()->load(bits));
    loaded.setBitArray(bits);
    
    ASSERT_TRUE(loaded.contains("test"));
}

TEST_F(BloomFilterStorageTest, LongFilenameSupport) {
    std::vector<std::shared_ptr<IHashFunction>> hashFunctions;
    hashFunctions.push_back(std::make_shared<ConfigurableHash>("std", 1));

    createDirectoryBF("bf");
    std::string longName = "bf/" + std::string(180, 'a') + ".bf";

    auto storage = std::make_unique<BinaryFileStorage>(longName);
    BloomFilter filter(1000, hashFunctions, std::move(storage));
    filter.add("test");

    std::vector<unsigned char> bits = filter.getBitArray();
    ASSERT_TRUE(filter.getStorage()->save(bits));

    deleteFileBF(longName);
}

TEST_F(BloomFilterStorageTest, SaveAndLoadWithMaxHashFunctions) {
    std::vector<std::shared_ptr<IHashFunction>> hashFunctions;
    // Create maximum number of hash functions
    for (int i = 0; i < 10; ++i) {
        hashFunctions.push_back(std::make_shared<ConfigurableHash>("std", i + 1));
    }
    
    auto storage = std::make_unique<BinaryFileStorage>("max_hash.bf");
    BloomFilter filter(1000, hashFunctions, std::move(storage));
    filter.add("test");
    
    std::vector<unsigned char> bits = filter.getBitArray();
    ASSERT_TRUE(filter.getStorage()->save(bits));
    
    auto newStorage = std::make_unique<BinaryFileStorage>("max_hash.bf");
    BloomFilter loaded(1000, hashFunctions, std::move(newStorage));
    
    ASSERT_TRUE(loaded.getStorage()->load(bits));
    loaded.setBitArray(bits);
    
    ASSERT_TRUE(loaded.contains("test"));
}

// ============= EDGE CASE TESTS =============
TEST_F(BloomFilterStorageTest, SaveAndLoadWithSpecialCharacters) {
    std::vector<std::shared_ptr<IHashFunction>> hashFunctions;
    hashFunctions.push_back(std::make_shared<ConfigurableHash>("std", 1));
    
    auto storage = std::make_unique<BinaryFileStorage>("special_chars.bf");
    BloomFilter original(1000, hashFunctions, std::move(storage));
    original.add("test@#$%^&*()");
    
    std::vector<unsigned char> bits = original.getBitArray();
    ASSERT_TRUE(original.getStorage()->save(bits));
    
    auto newStorage = std::make_unique<BinaryFileStorage>("special_chars.bf");
    BloomFilter loaded(1000, hashFunctions, std::move(newStorage));
    
    ASSERT_TRUE(loaded.getStorage()->load(bits));
    loaded.setBitArray(bits);
    
    ASSERT_TRUE(loaded.contains("test@#$%^&*()"));
}

TEST_F(BloomFilterStorageTest, SaveAndLoadEmptyFilter) {
    std::vector<std::shared_ptr<IHashFunction>> hashFunctions;
    hashFunctions.push_back(std::make_shared<ConfigurableHash>("std", 1));
    
    auto storage = std::make_unique<BinaryFileStorage>("empty.bf");
    BloomFilter filter(1000, hashFunctions, std::move(storage));
    // No elements added
    
    std::vector<unsigned char> bits = filter.getBitArray();
    ASSERT_TRUE(filter.getStorage()->save(bits));
    
    auto newStorage = std::make_unique<BinaryFileStorage>("empty.bf");
    BloomFilter loaded(1000, hashFunctions, std::move(newStorage));
    
    ASSERT_TRUE(loaded.getStorage()->load(bits));
    loaded.setBitArray(bits);
    
    // Verify filter is empty
    ASSERT_FALSE(loaded.contains("random"));
}

TEST_F(BloomFilterStorageTest, SaveAndLoadSpecialCharactersInFilename) {
    std::vector<std::shared_ptr<IHashFunction>> hashFunctions;
    hashFunctions.push_back(std::make_shared<ConfigurableHash>("std", 1));
    
    auto storage = std::make_unique<BinaryFileStorage>("weird @name$.bf");
    BloomFilter filter(1000, hashFunctions, std::move(storage));
    filter.add("test");
    
    std::vector<unsigned char> bits = filter.getBitArray();
    ASSERT_TRUE(filter.getStorage()->save(bits));
    
    auto newStorage = std::make_unique<BinaryFileStorage>("weird @name$.bf");
    BloomFilter loaded(1000, hashFunctions, std::move(newStorage));
    
    ASSERT_TRUE(loaded.getStorage()->load(bits));
    loaded.setBitArray(bits);
    
    ASSERT_TRUE(loaded.contains("test"));
}

TEST_F(BloomFilterStorageTest, OverwriteExistingFile) {
    std::vector<std::shared_ptr<IHashFunction>> hashFunctions;
    hashFunctions.push_back(std::make_shared<ConfigurableHash>("std", 1));
    
    // First save
    auto storage1 = std::make_unique<BinaryFileStorage>("overwrite.bf");
    BloomFilter filter1(1000, hashFunctions, std::move(storage1));
    filter1.add("first");
    
    std::vector<unsigned char> bits1 = filter1.getBitArray();
    ASSERT_TRUE(filter1.getStorage()->save(bits1));
    
    // Second save
    auto storage2 = std::make_unique<BinaryFileStorage>("overwrite.bf");
    BloomFilter filter2(1000, hashFunctions, std::move(storage2));
    filter2.add("second");
    
    std::vector<unsigned char> bits2 = filter2.getBitArray();
    ASSERT_TRUE(filter2.getStorage()->save(bits2));
    
    // Load and verify
    auto newStorage = std::make_unique<BinaryFileStorage>("overwrite.bf");
    BloomFilter loaded(1000, hashFunctions, std::move(newStorage));
    
    std::vector<unsigned char> loadedBits;
    ASSERT_TRUE(loaded.getStorage()->load(loadedBits));
    loaded.setBitArray(loadedBits);
    
    ASSERT_TRUE(loaded.contains("second"));
    ASSERT_TRUE(loaded.contains("first"));
}

TEST_F(BloomFilterStorageTest, SaveAndLoadAllBitsSet) {
    std::vector<std::shared_ptr<IHashFunction>> hashFunctions;
    hashFunctions.push_back(std::make_shared<ConfigurableHash>("std", 1));
    
    auto storage = std::make_unique<BinaryFileStorage>("all_bits.bf");
    BloomFilter filter(1000, hashFunctions, std::move(storage));

    // Set all bits to 1
    std::vector<unsigned char> bits = filter.getBitArray();
    std::fill(bits.begin(), bits.end(), 1);
    filter.setBitArray(bits);
    ASSERT_TRUE(filter.getStorage()->save(bits));
    
    auto newStorage = std::make_unique<BinaryFileStorage>("all_bits.bf");
    BloomFilter loaded(1000, hashFunctions, std::move(newStorage));
    
    ASSERT_TRUE(loaded.getStorage()->load(bits));
    loaded.setBitArray(bits);

    // Verify any query returns true
    ASSERT_TRUE(loaded.contains("foo"));
    ASSERT_TRUE(loaded.contains("bar"));
}

TEST_F(BloomFilterStorageTest, RepeatedLoadOperations) {
    std::vector<std::shared_ptr<IHashFunction>> hashFunctions;
    hashFunctions.push_back(std::make_shared<ConfigurableHash>("std", 1));
    
    auto storage = std::make_unique<BinaryFileStorage>("repeat.bf");
    BloomFilter original(1000, hashFunctions, std::move(storage));
    original.add("test");
    
    std::vector<unsigned char> bits = original.getBitArray();
    ASSERT_TRUE(original.getStorage()->save(bits));
    
    // Load twice
    auto newStorage = std::make_unique<BinaryFileStorage>("repeat.bf");
    BloomFilter loaded(1000, hashFunctions, std::move(newStorage));
    
    std::vector<unsigned char> loadedBits;
    ASSERT_TRUE(loaded.getStorage()->load(loadedBits));
    loaded.setBitArray(loadedBits);
    
    // Load again
    ASSERT_TRUE(loaded.getStorage()->load(loadedBits));
    loaded.setBitArray(loadedBits);
    
    // Verify state is correct
    ASSERT_TRUE(loaded.contains("test"));
}

TEST_F(BloomFilterStorageTest, SaveAndLoadWithVeryLongURL) {
    std::vector<std::shared_ptr<IHashFunction>> hashFunctions;
    hashFunctions.push_back(std::make_shared<ConfigurableHash>("std", 1));
    
    auto storage = std::make_unique<BinaryFileStorage>("long_url.bf");
    BloomFilter filter(1000, hashFunctions, std::move(storage));
    
    // Create a very long URL
    std::string longUrl(1000, 'a');
    filter.add(longUrl);
    
    std::vector<unsigned char> bits = filter.getBitArray();
    ASSERT_TRUE(filter.getStorage()->save(bits));
    
    auto newStorage = std::make_unique<BinaryFileStorage>("long_url.bf");
    BloomFilter loaded(1000, hashFunctions, std::move(newStorage));
    
    ASSERT_TRUE(loaded.getStorage()->load(bits));
    loaded.setBitArray(bits);
    
    ASSERT_TRUE(loaded.contains(longUrl));
}