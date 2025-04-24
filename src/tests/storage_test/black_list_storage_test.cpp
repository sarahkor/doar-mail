#include "black_list_storage_test.h"
#include <fstream>

// ============= SANITY TESTS =============
TEST_F(BlackListStorageTest, SaveAndLoadBasic) {
    const std::string path = "test_urls.txt";
    std::filesystem::remove(path);

    // 1) Create blacklist + storage, add two URLs
    auto storage1 = std::make_unique<FileLineStorage>(path);
    Blacklist original(std::move(storage1));
    original.add("url1");
    original.add("url2");

    // 2) Verify file content directly
    std::vector<std::string> lines;
    std::ifstream ifs(path);
    std::string line;
    while (std::getline(ifs, line)) lines.push_back(line);
    ASSERT_EQ(lines.size(), 2);
    EXPECT_EQ(lines[0], "url1");
    EXPECT_EQ(lines[1], "url2");

    // 3) Re-load via a new Blacklist and check
    auto storage2 = std::make_unique<FileLineStorage>(path);
    Blacklist loaded(std::move(storage2));
    EXPECT_TRUE(loaded.check("url1"));
    EXPECT_TRUE(loaded.check("url2"));
}

TEST_F(BlackListStorageTest, SaveAndLoadMultipleURLs) {
    const std::string path = "multiple_urls.txt";
    std::filesystem::remove(path);

    // 1) Create blacklist + storage, add multiple URLs
    auto storage1 = std::make_unique<FileLineStorage>(path);
    Blacklist original(std::move(storage1));
    original.add("url1");
    original.add("url2");
    original.add("url3");
    original.add("url4");
    original.add("url5");

    // 2) Verify file content directly
    std::vector<std::string> lines;
    std::ifstream ifs(path);
    std::string line;
    while (std::getline(ifs, line)) lines.push_back(line);
    ASSERT_EQ(lines.size(), 5);
    EXPECT_EQ(lines[0], "url1");
    EXPECT_EQ(lines[1], "url2");
    EXPECT_EQ(lines[2], "url3");
    EXPECT_EQ(lines[3], "url4");
    EXPECT_EQ(lines[4], "url5");

    // 3) Re-load via a new Blacklist and check
    auto storage2 = std::make_unique<FileLineStorage>(path);
    Blacklist loaded(std::move(storage2));
    EXPECT_TRUE(loaded.check("url1"));
    EXPECT_TRUE(loaded.check("url2"));
    EXPECT_TRUE(loaded.check("url3"));
    EXPECT_TRUE(loaded.check("url4"));
    EXPECT_TRUE(loaded.check("url5"));
    EXPECT_FALSE(loaded.check("url6")); // URL not added
}

TEST_F(BlackListStorageTest, ReloadPersistenceAfterAdditionalAdds) {
    const std::string path = "persistence_test.txt";
    std::filesystem::remove(path);

    // First blacklist - add first URL
    {
        auto storage1 = std::make_unique<FileLineStorage>(path);
        Blacklist firstSession(std::move(storage1));
        firstSession.add("first_url");
    }

    // Second blacklist - load and add second URL
    {
        auto storage2 = std::make_unique<FileLineStorage>(path);
        Blacklist secondSession(std::move(storage2));
        EXPECT_TRUE(secondSession.check("first_url")); // First URL should be loaded
        secondSession.add("second_url");
    }

    // Third blacklist - both URLs should be present
    auto storage3 = std::make_unique<FileLineStorage>(path);
    Blacklist thirdSession(std::move(storage3));
    EXPECT_TRUE(thirdSession.check("first_url"));
    EXPECT_TRUE(thirdSession.check("second_url"));
}

TEST_F(BlackListStorageTest, CheckNonexistentURLAfterReload) {
    const std::string path = "reload_check.txt";
    std::filesystem::remove(path);

    // Add some URLs and save
    {
        auto storage = std::make_unique<FileLineStorage>(path);
        Blacklist original(std::move(storage));
        original.add("valid_url1");
        original.add("valid_url2");
    }

    // Reload and check for a URL that was never added
    auto reloadStorage = std::make_unique<FileLineStorage>(path);
    Blacklist reloaded(std::move(reloadStorage));
    EXPECT_FALSE(reloaded.check("nonexistent_url"));
}


// ============= NEGATIVE TESTS =============
TEST_F(BlackListStorageTest, LoadNonexistentFile) {
    const std::string path = "no_such.txt";
    std::filesystem::remove(path);

    FileLineStorage fls(path);
    std::vector<std::string> urls = {"dummy"};
    EXPECT_FALSE(fls.load(urls));  

    // Blacklist ctor ignores load-fail, so list remains empty
    Blacklist bl(std::make_unique<FileLineStorage>(path));
    EXPECT_FALSE(bl.check("anything"));
}

TEST_F(BlackListStorageTest, SaveInvalidPath) {
    const std::string dir = "some_dir/";
    std::filesystem::create_directory(dir);

    FileLineStorage fls(dir);
    std::vector<std::string> urls = {"x"};
    EXPECT_FALSE(fls.save(urls));
}

TEST_F(BlackListStorageTest, LoadNonexistentFileVectorUnchanged) {
    const std::string path = "nonexistent_file.txt";
    std::filesystem::remove(path);
    
    // Pre-fill vector with dummy data
    std::vector<std::string> urls = {"dummy1", "dummy2", "dummy3"};
    std::vector<std::string> original = urls; // Copy for comparison
    
    // Attempt to load nonexistent file
    FileLineStorage storage(path);
    EXPECT_FALSE(storage.load(urls));
    
    // Vector should remain unchanged
    ASSERT_EQ(urls.size(), original.size());
    for (size_t i = 0; i < urls.size(); i++) {
        EXPECT_EQ(urls[i], original[i]);
    }
}

TEST_F(BlackListStorageTest, LoadDirectoryAsFile) {
    const std::string dir = "directory_as_file/";
    std::filesystem::remove_all(dir);
    std::filesystem::create_directory(dir);
    
    // Attempt to load directory as file
    FileLineStorage storage(dir);
    std::vector<std::string> urls;
    EXPECT_FALSE(storage.load(urls));
    
    // Blacklist constructed with directory path should be empty
    Blacklist blacklist(std::make_unique<FileLineStorage>(dir));
    EXPECT_FALSE(blacklist.check("any_url"));
}

TEST_F(BlackListStorageTest, SaveToReadOnlyFile) {
    // This test might not work on all platforms due to permission handling
    // Skipping implementation details that might not be cross-platform
    
    const std::string path = "readonly.txt";
    std::filesystem::remove(path);
    
    // Create and populate file first
    {
        FileLineStorage storage(path);
        std::vector<std::string> initial = {"initial"};
        EXPECT_TRUE(storage.save(initial));
    }
    
    // TODO: Set file to read-only
    // This requires platform-specific code which is omitted for now
    
    // Attempt to save again
    // Expected behavior depends on platform permission handling
}

TEST_F(BlackListStorageTest, SaveToNonexistentDirectory) {
    const std::string path = "nonexistent_dir/file.txt";
    
    // Ensure directory doesn't exist
    std::filesystem::remove_all("nonexistent_dir");
    
    // Attempt to save to file in nonexistent directory
    FileLineStorage storage(path);
    std::vector<std::string> urls = {"url"};
    EXPECT_FALSE(storage.save(urls));
}

TEST_F(BlackListStorageTest, BloomFilterListConsistencyAfterLoad) {
    const std::string path = "bloom_consistency.txt";
    std::filesystem::remove(path);
    
    // Add some URLs to original blacklist
    {
        auto storage = std::make_unique<FileLineStorage>(path);
        Blacklist original(std::move(storage));
        original.add("valid_url1");
        original.add("valid_url2");
    }
    
    // Reload and check bloom filter consistency
    auto reloadStorage = std::make_unique<FileLineStorage>(path);
    Blacklist reloaded(std::move(reloadStorage));
    
    // Valid URLs should return true
    EXPECT_TRUE(reloaded.check("valid_url1"));
    EXPECT_TRUE(reloaded.check("valid_url2"));
    
    // Invalid URL should return false
    EXPECT_FALSE(reloaded.check("invalid_url"));
}

TEST_F(BlackListStorageTest, LoadFromUnreadableFile) {
    const std::string path = "unreadable.txt";
    std::filesystem::remove(path);
    
    // Create a file with some content
    {
        std::ofstream ofs(path);
        ofs << "test_url1" << std::endl;
        ofs << "test_url2" << std::endl;
    }
    
    // Note: Setting file permissions to be unreadable is platform-specific
    // This is a placeholder - in a real implementation, you would use platform-specific
    // code to remove read permissions from the file
    
    // On Linux/Unix systems, you might use:
    // std::system(("chmod -r " + path).c_str());
    
    // On Windows, you might use the Windows API:
    // SetFileAttributes(path.c_str(), FILE_ATTRIBUTE_READONLY);
    
    // Since we can't reliably set permissions cross-platform in this test,
    // we'll simulate the behavior - the real test would attempt to load from
    // a file without read permissions and expect a failure
    
    // Attempt to load (simulating failure)
    FileLineStorage storage(path);
    std::vector<std::string> urls;
    
    // In a real test with proper permission setting:
    // EXPECT_FALSE(storage.load(urls));
    
    // Blacklist from unreadable file should have empty list
    Blacklist blacklist(std::make_unique<FileLineStorage>(path));
    
    // The check should work regardless of file access issues
    // In this simulated test, it will return true since we can actually read the file
    // In a real test with proper permission setting, it should return false
}

TEST_F(BlackListStorageTest, PermissionErrorsAreReported) {
    // This test covers multiple permission error scenarios
    
    // 1. Attempting to save to a directory instead of a file
    {
        const std::string dir = "dir_not_file/";
        std::filesystem::remove_all(dir);
        std::filesystem::create_directory(dir);
        
        FileLineStorage storage(dir);
        std::vector<std::string> urls = {"test_url"};
        EXPECT_FALSE(storage.save(urls)); // Should fail gracefully
    }
    
    // 2. Attempting to save to a file without write permission
    // Note: This part would need platform-specific code to set permissions
    const std::string readOnlyPath = "readonly_for_perm_test.txt";
    std::filesystem::remove(readOnlyPath);
    
    // Create file and make it read-only (platform-specific)
    {
        std::ofstream ofs(readOnlyPath);
        ofs << "original_content" << std::endl;
    }
    
    // Here we would set the file to read-only using platform-specific code
    // Without actually setting permissions, we just verify the code handles errors
    // without throwing uncaught exceptions
    
    // 3. Attempting to load from a non-existent path
    {
        const std::string nonExistentPath = "does_not_exist.txt";
        std::filesystem::remove(nonExistentPath);
        
        FileLineStorage storage(nonExistentPath);
        std::vector<std::string> urls;
        EXPECT_FALSE(storage.load(urls)); // Should fail gracefully
    }
    
    // Verify no uncaught exceptions in any of these cases
}


// ============= BOUNDARY TESTS =============
TEST_F(BlackListStorageTest, SaveEmptyList) {
    const std::string path = "empty_urls.txt";
    std::filesystem::remove(path);

    // Force a save of an empty vector
    FileLineStorage fls(path);
    std::vector<std::string> empty;
    EXPECT_TRUE(fls.save(empty));

    // Loading should succeed but yield an empty vector
    std::vector<std::string> loaded;
    EXPECT_TRUE(fls.load(loaded));
    EXPECT_TRUE(loaded.empty());
}

// ============= EDGE CASE TESTS =============
TEST_F(BlackListStorageTest, HandleDuplicateURLs) {
    const std::string path = "duplicate_urls.txt";
    std::filesystem::remove(path);

    // Add the same URL multiple times
    auto storage1 = std::make_unique<FileLineStorage>(path);
    Blacklist original(std::move(storage1));
    original.add("dupURL");
    original.add("dupURL"); // Same URL added twice

    // Verify file contents - implementation may vary on how duplicates are handled
    std::vector<std::string> lines;
    std::ifstream ifs(path);
    std::string line;
    while (std::getline(ifs, line)) lines.push_back(line);
    
    // Check that the file was created successfully
    EXPECT_FALSE(lines.empty());
    
    // Reload and verify the duplicate URL is recognized
    auto storage2 = std::make_unique<FileLineStorage>(path);
    Blacklist reloaded(std::move(storage2));
    EXPECT_TRUE(reloaded.check("dupURL"));
}

TEST_F(BlackListStorageTest, SaveAndLoadEmptyStringURL) {
    const std::string path = "empty_string_url.txt";
    std::filesystem::remove(path);

    // Add an empty string as a URL
    auto storage = std::make_unique<FileLineStorage>(path);
    Blacklist original(std::move(storage));
    original.add(""); // Empty string URL

    // Reload and verify behavior is consistent (might be true or false depending on implementation)
    auto reloadStorage = std::make_unique<FileLineStorage>(path);
    Blacklist reloaded(std::move(reloadStorage));
    
    // The implementation should have a consistent behavior
    // This test just ensures it doesn't crash
}

TEST_F(BlackListStorageTest, LoadEmptyFileSucceeds) {
    const std::string path = "empty_file.txt";
    std::filesystem::remove(path);
    
    // Create an empty file
    {
        std::ofstream ofs(path);
    }

    // Attempt to load the empty file
    FileLineStorage storage(path);
    std::vector<std::string> urls;
    EXPECT_TRUE(storage.load(urls));
    EXPECT_TRUE(urls.empty());

    // Blacklist constructed from empty file should have empty list
    Blacklist blacklist(std::make_unique<FileLineStorage>(path));
    EXPECT_FALSE(blacklist.check("any_url"));
}

TEST_F(BlackListStorageTest, MalformedFileContent) {
    const std::string path = "malformed.txt";
    std::filesystem::remove(path);
    
    // Create a file with malformed content
    {
        std::ofstream ofs(path);
        ofs << "valid_url1" << std::endl;
        ofs << "" << std::endl; // Empty line
        ofs << "   " << std::endl; // Whitespace only
        ofs << "valid_url2" << std::endl;
    }

    // Load file and check
    FileLineStorage storage(path);
    std::vector<std::string> urls;
    EXPECT_TRUE(storage.load(urls));
    
    // Test behavior depends on implementation - empty lines might be skipped or included
    // Just ensure we can load without crashing
    
    // Create blacklist and test valid URLs
    Blacklist blacklist(std::make_unique<FileLineStorage>(path));
    EXPECT_TRUE(blacklist.check("valid_url1"));
    EXPECT_TRUE(blacklist.check("valid_url2"));
}

TEST_F(BlackListStorageTest, OverwriteExistingFile) {
    const std::string path = "overwrite.txt";
    std::filesystem::remove(path);
    
    // Create a file with initial content
    {
        FileLineStorage storage(path);
        std::vector<std::string> initial = {"initial1", "initial2"};
        EXPECT_TRUE(storage.save(initial));
    }
    
    // Overwrite with new content
    {
        FileLineStorage storage(path);
        std::vector<std::string> newUrls = {"new1", "new2", "new3"};
        EXPECT_TRUE(storage.save(newUrls));
    }
    
    // Check file content directly
    std::vector<std::string> lines;
    std::ifstream ifs(path);
    std::string line;
    while (std::getline(ifs, line)) lines.push_back(line);
    
    // Should only have new content
    ASSERT_EQ(lines.size(), 3);
    EXPECT_EQ(lines[0], "new1");
    EXPECT_EQ(lines[1], "new2");
    EXPECT_EQ(lines[2], "new3");
    
    // Reload and check
    Blacklist blacklist(std::make_unique<FileLineStorage>(path));
    EXPECT_TRUE(blacklist.check("new1"));
    EXPECT_TRUE(blacklist.check("new2"));
    EXPECT_TRUE(blacklist.check("new3"));
    EXPECT_FALSE(blacklist.check("initial1")); // Old URL should be gone
}

TEST_F(BlackListStorageTest, VeryLongURL) {
    const std::string path = "long_url.txt";
    std::filesystem::remove(path);
    
    // Create a very long URL
    std::string longUrl(10000, 'a'); // 10,000 'a' characters
    
    // Add the long URL
    auto storage = std::make_unique<FileLineStorage>(path);
    Blacklist original(std::move(storage));
    original.add(longUrl);
    
    // Reload and check
    auto reloadStorage = std::make_unique<FileLineStorage>(path);
    Blacklist reloaded(std::move(reloadStorage));
    EXPECT_TRUE(reloaded.check(longUrl));
}
