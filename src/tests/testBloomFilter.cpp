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
    // May be true, but shouldn't crash or behave badly
    EXPECT_TRUE(filter.contains(""));  
}

// ========== BOUNDARY TESTS ==========

TEST(BloomFilterBoundary, TinyFilterSizeDoesNotCrash) {
    auto hash = std::make_shared<ConfigurableHash>("std", 1);
    BloomFilter filter(1, {hash});  // Only one bit!

    filter.add("a");
    filter.add("b");
    filter.add("c");

    // Everything hashes to the same bit, may all return true
    EXPECT_TRUE(filter.contains("x"));  // Likely true due to collision
}

TEST(BloomFilterBoundary, VeryLongURLDoesNotCrash) {
    auto hash = std::make_shared<ConfigurableHash>("std", 1);
    BloomFilter filter(256, {hash});

    std::string longURL(5000, 'a');  // "aaaa...aaaa" (length = 5000)
    filter.add(longURL);
    EXPECT_TRUE(filter.contains(longURL));
}
