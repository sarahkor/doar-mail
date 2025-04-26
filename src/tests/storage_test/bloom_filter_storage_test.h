#ifndef BLOOM_FILTER_STORAGE_TEST_H
#define BLOOM_FILTER_STORAGE_TEST_H

#include <gtest/gtest.h>
#include "BloomFilter.h"
#include "BinaryFileStorage.h"
#include "ConfigurableHash.h"
#include <memory>
#include <vector>

class BloomFilterStorageTest : public ::testing::Test {
protected:
    void SetUp() override {
        // Setup code for each test
    }

    void TearDown() override {
        // Cleanup code for each test
    }
};

#endif // BLOOM_FILTER_STORAGE_TEST_H