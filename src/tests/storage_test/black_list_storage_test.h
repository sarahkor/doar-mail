#ifndef BLACK_LIST_STORAGE_TEST_H
#define BLACK_LIST_STORAGE_TEST_H

#include <gtest/gtest.h>
#include "Blacklist.h"
#include "FileLineStorage.h"
#include <vector>
#include <fstream>

// Fixture for testing Blacklist + FileLineStorage
class BlackListStorageTest : public ::testing::Test {
protected:
    void TearDown() override {
        // remove any files our tests might have created
        std::ofstream("test_urls.txt", std::ios::trunc).close(); // Truncate file to size 0
        std::ofstream("empty_urls.txt", std::ios::trunc).close();
        std::ofstream("no_such.txt", std::ios::trunc).close();
    }
};

#endif // BLACK_LIST_STORAGE_TEST_H
