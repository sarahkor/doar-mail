#ifndef BLACK_LIST_STORAGE_TEST_H
#define BLACK_LIST_STORAGE_TEST_H

#include <gtest/gtest.h>
#include "../../src/Blacklist.h"
#include "../../src/FileLineStorage.h"
#include <filesystem>
#include <vector>

// Fixture for testing Blacklist + FileLineStorage
class BlackListStorageTest : public ::testing::Test {
protected:
    void TearDown() override {
        // remove any files our tests might have created
        std::filesystem::remove("test_urls.txt");
        std::filesystem::remove("empty_urls.txt");
        std::filesystem::remove("no_such.txt");
    }
};

#endif // BLACK_LIST_STORAGE_TEST_H
