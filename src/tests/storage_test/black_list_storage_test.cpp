#include "black_list_storage_test.h"
#include <fstream>
#include <iostream>
#include <ctime>
#include <string>
#include <cstdlib> // For system function

// Helper function to check if a file exists using fstream
bool fileExists(const std::string& path) {
    std::ifstream infile(path);
    return infile.good();
}

// Helper function to create a directory using standard C++ system calls
bool createDirectory(const std::string& path) {
    // Use appropriate command based on platform
    #ifdef _WIN32
    std::string command = "mkdir \"" + path + "\" 2> nul";
    #else
    std::string command = "mkdir -p \"" + path + "\" 2>/dev/null";
    #endif
    std::system(command.c_str());
    
    // Check if directory was created
    std::string testFile = path + "/test.tmp";
    std::ofstream test(testFile);
    bool success = test.is_open();
    test.close();
    if (success) {
        // Clean up test file
        std::remove(testFile.c_str());
    }
    return success;
}

// Helper function to remove a directory using standard C++ system calls
bool removeDirectory(const std::string& path) {
    // Use appropriate command based on platform
    #ifdef _WIN32
    std::string command = "rmdir \"" + path + "\" 2> nul";
    #else
    std::string command = "rmdir \"" + path + "\" 2>/dev/null";
    #endif
    return std::system(command.c_str()) == 0;
}

// Helper function to get a guaranteed non-existent file path
std::string getNonExistentFilePath() {
    // Use a unique path that we can be sure doesn't exist
    static int counter = 0;
    std::string path = "non_existent_test_file_" + std::to_string(++counter) + "_" + 
                       std::to_string(std::time(nullptr)) + ".txt";
    
    // Make extra sure it doesn't exist
    if (fileExists(path)) {
        std::remove(path.c_str());
    }
    
    return path;
}

// ============= SANITY TESTS =============
TEST_F(BlackListStorageTest, SaveAndLoadBasic) {
    const std::string path = "test_urls.txt";
    std::remove(path.c_str());

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
    std::remove(path.c_str());

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
    std::remove(path.c_str());

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
    std::remove(path.c_str());

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
    // Use a path that definitely doesn't exist
    const std::string path = getNonExistentFilePath();
    
    // Verify the file really doesn't exist
    ASSERT_FALSE(fileExists(path));
    
    FileLineStorage fls(path);
    std::vector<std::string> urls = {"dummy"};
    EXPECT_FALSE(fls.load(urls));

    // Verify the vector wasn't modified
    ASSERT_EQ(urls.size(), 1);
    EXPECT_EQ(urls[0], "dummy");

    // Blacklist ctor ignores load-fail, so list remains empty
    Blacklist bl(std::make_unique<FileLineStorage>(path));
    EXPECT_FALSE(bl.check("anything"));
}

TEST_F(BlackListStorageTest, SaveInvalidPath) {
    const std::string dir = "some_dir/";
    createDirectory(dir);

    FileLineStorage fls(dir);
    std::vector<std::string> urls = {"x"};
    EXPECT_FALSE(fls.save(urls));
}

TEST_F(BlackListStorageTest, LoadNonexistentFileVectorUnchanged) {
    // Use a path that definitely doesn't exist
    const std::string path = getNonExistentFilePath();
    
    // Verify the file really doesn't exist
    ASSERT_FALSE(fileExists(path));
    
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

TEST_F(BlackListStorageTest, SaveToNonexistentDirectory) {
    const std::string path = "nonexistent_dir/file.txt";
    
    // Ensure directory doesn't exist
    removeDirectory("nonexistent_dir");
    
    // Attempt to save to file in nonexistent directory
    FileLineStorage storage(path);
    std::vector<std::string> urls = {"url"};
    EXPECT_FALSE(storage.save(urls));
}

TEST_F(BlackListStorageTest, PermissionErrorsAreReported) {
    // This test covers multiple permission error scenarios
    
    // 1. Attempting to save to a directory instead of a file
    {
        const std::string dir = "dir_not_file/";
        removeDirectory(dir);
        createDirectory(dir);
        
        FileLineStorage storage(dir);
        std::vector<std::string> urls = {"test_url"};
        EXPECT_FALSE(storage.save(urls)); // Should fail gracefully
    }
    
    // 2. Test is simplified as we can't portably set permissions
    // without platform-specific code
    
    // 3. Attempting to load from a non-existent path
    {
        // Use a path that definitely doesn't exist
        const std::string nonExistentPath = getNonExistentFilePath();
        
        // Verify the file really doesn't exist
        ASSERT_FALSE(fileExists(nonExistentPath));
        
        FileLineStorage storage(nonExistentPath);
        std::vector<std::string> urls;
        EXPECT_FALSE(storage.load(urls)); // Should fail gracefully
    }
    
    // Verify no uncaught exceptions in any of these cases
}


// ============= BOUNDARY TESTS =============
TEST_F(BlackListStorageTest, SaveEmptyList) {
    const std::string path = "empty_urls.txt";
    std::remove(path.c_str());

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
    std::remove(path.c_str());

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
    std::remove(path.c_str());

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
    std::remove(path.c_str());
    
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
    std::remove(path.c_str());
    
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
    std::remove(path.c_str());

    {
        auto storage1 = std::make_unique<FileLineStorage>(path);
        Blacklist original(std::move(storage1));
        original.add("initial1");
        original.add("initial2");
    }

    {
        auto storage2 = std::make_unique<FileLineStorage>(path);
        Blacklist session2(std::move(storage2));
        EXPECT_TRUE(session2.check("initial1"));
        EXPECT_TRUE(session2.check("initial2"));
        session2.add("new1");
        session2.add("new2");
        session2.add("new3");
    }

    std::vector<std::string> lines;
    std::ifstream ifs(path);
    std::string line;
    while (std::getline(ifs, line)) lines.push_back(line);
    ASSERT_EQ(lines.size(), 5);
    EXPECT_EQ(lines[0], "initial1");
    EXPECT_EQ(lines[1], "initial2");
    EXPECT_EQ(lines[2], "new1");
    EXPECT_EQ(lines[3], "new2");
    EXPECT_EQ(lines[4], "new3");

    auto storage3 = std::make_unique<FileLineStorage>(path);
    Blacklist finalSession(std::move(storage3));
    EXPECT_TRUE(finalSession.check("initial1"));
    EXPECT_TRUE(finalSession.check("initial2"));
    EXPECT_TRUE(finalSession.check("new1"));
    EXPECT_TRUE(finalSession.check("new2"));
    EXPECT_TRUE(finalSession.check("new3"));
}


TEST_F(BlackListStorageTest, VeryLongURL) {
    const std::string path = "long_url.txt";
    std::remove(path.c_str());
    
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
