#include <gtest/gtest.h>
#include "BloomFilter.h"
#include "ConfigurableHash.h"

// ========== SANITY TESTS ==========

TEST(BloomFilterSanity, AddAndContainsWorks) {
    auto hash = std::make_shared<ConfigurableHash>("std", 1);
    BloomFilter filter(128, {hash});

    filter.add("google.com");
    EXPECT_TRUE(filter.contains("google.com"));
}

TEST(BloomFilterSanity, MultipleAddsBehaveCorrectly) {
    auto hash = std::make_shared<ConfigurableHash>("std", 1);
    BloomFilter filter(128, {hash});

    filter.add("youtube.com");
    filter.add("github.com");

    EXPECT_TRUE(filter.contains("youtube.com"));
    EXPECT_TRUE(filter.contains("github.com"));
    EXPECT_FALSE(filter.contains("not-added.com"));
}

// ========== NEGATIVE TESTS ==========

TEST(BloomFilterNegative, ContainsReturnsFalseForMissingURL) {
    auto hash = std::make_shared<ConfigurableHash>("std", 1);
    BloomFilter filter(128, {hash});

    EXPECT_FALSE(filter.contains("definitely-not-there.com"));
}

TEST(BloomFilterNegative, HandlesEmptyString) {
    auto hash = std::make_shared<ConfigurableHash>("std", 1);
    BloomFilter filter(128, {hash});

    filter.add("");
    EXPECT_TRUE(filter.contains(""));  
}

// ========== BOUNDARY TESTS ==========

TEST(BloomFilterBoundary, TinyFilterSizeDoesNotCrash) {
    auto hash = std::make_shared<ConfigurableHash>("std", 1);
    BloomFilter filter(1, {hash});  // Only one bit!

    filter.add("a");
    filter.add("b");
    filter.add("c");

    EXPECT_TRUE(filter.contains("x"));  // Likely true due to collision
}

TEST(BloomFilterBoundary, VeryLongURLDoesNotCrash) {
    auto hash = std::make_shared<ConfigurableHash>("std", 1);
    BloomFilter filter(256, {hash});

    std::string longURL(5000, 'a');  // "aaaa...aaaa"
    filter.add(longURL);
    EXPECT_TRUE(filter.contains(longURL));
}

// ========== MULTI-HASH TESTS ==========

TEST(BloomFilterMultipleHashes, SupportsTwoHashFunctions) {
    auto hash1 = std::make_shared<ConfigurableHash>("std", 1);
    auto hash2 = std::make_shared<ConfigurableHash>("std", 2);
    BloomFilter filter(256, {hash1, hash2});

    filter.add("multi.com");
    EXPECT_TRUE(filter.contains("multi.com"));
    EXPECT_FALSE(filter.contains("not-inserted.com"));
}

// ========== FALSE POSITIVE TESTS ==========

TEST(BloomFilterFalsePositive, RateIsWithinReasonableBounds) {
    auto hash = std::make_shared<ConfigurableHash>("std", 4);  // increased hashes
    BloomFilter filter(4096, {hash});  // increased size

    for (int i = 0; i < 500; ++i) {
        filter.add("added_" + std::to_string(i));
    }

    int falsePositives = 0;
    for (int i = 1000; i < 1100; ++i) {
        if (filter.contains("not_added_" + std::to_string(i))) {
            falsePositives++;
        }
    }

    double rate = falsePositives / 100.0;
    EXPECT_LT(rate, 0.2);  // Acceptable false positive rate
}

// ========== STRESS TESTS ==========

TEST(BloomFilterStressTest, HandlesThousandsOfInserts) {
    auto hash = std::make_shared<ConfigurableHash>("std", 3);
    BloomFilter filter(20000, {hash});  // larger bit array

    for (int i = 0; i < 3000; ++i) {
        filter.add("bulk_" + std::to_string(i));
    }

    EXPECT_TRUE(filter.contains("bulk_2999"));

    int falsePositives = 0;
    for (int i = 3000; i < 3100; ++i) {
        if (filter.contains("bulk_" + std::to_string(i))) {
            falsePositives++;
        }
    }

    double rate = falsePositives / 100.0;
    EXPECT_LT(rate, 0.2);  // Acceptable rate under stress
}
