#include "black_list_storage_test.h"
#include <fstream>

// ============= POSITIVE TESTS =============
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

