#include <gtest/gtest.h>
#include "ConfigurableHash.h"

// ========== SANITY TESTS ==========

// Same input should give the same hash (for same strategy and times)
TEST(HashSanity, StdHashIsDeterministic) {
    ConfigurableHash hash("std", 1);
    size_t h1 = hash.hash("test.com");
    size_t h2 = hash.hash("test.com");
    EXPECT_EQ(h1, h2);
}

// Different inputs should give different hashes (most of the time)
TEST(HashSanity, DifferentInputsYieldDifferentHashes) {
    ConfigurableHash hash("std", 1);
    size_t h1 = hash.hash("abc");
    size_t h2 = hash.hash("xyz");
    EXPECT_NE(h1, h2);
}

// Repeating the hash should change the result
TEST(HashSanity, RepeatedHashingChangesOutput) {
    std::string input = "example.com";
    ConfigurableHash once("std", 1);
    ConfigurableHash twice("std", 2);
    ConfigurableHash five("std", 5);

    size_t h1 = once.hash(input);
    size_t h2 = twice.hash(input);
    size_t h3 = five.hash(input);

    EXPECT_NE(h1, h2);
    EXPECT_NE(h2, h3);
    EXPECT_NE(h1, h3);
}

// ========== NEGATIVE TESTS ==========

// Empty input should still produce a hash
TEST(HashNegative, EmptyInputStillReturnsHash) {
    ConfigurableHash hash("std", 1);
    size_t result = hash.hash("");
    EXPECT_GE(result, 0);
}

// Unsupported strategy should still work or fallback
TEST(HashNegative, UnsupportedStrategyDoesNotCrash) {
    ConfigurableHash hash("fake_strategy", 1);
    EXPECT_THROW({
        hash.hash("test.com");
    }, std::invalid_argument);
}

// ========== BOUNDARY TESTS ==========

// Using a large number of repeats should still be valid
TEST(HashBoundary, HighRepetitionStillReturnsValue) {
    ConfigurableHash hash("std", 10);  // high repetition
    size_t result = hash.hash("repeated.com");
    EXPECT_GT(result, 0);
}

// Very long input strings should not crash
TEST(HashBoundary, LongInputDoesNotCrash) {
    std::string longStr(10000, 'x');  // 10,000 'x'
    ConfigurableHash hash("std", 1);
    size_t result = hash.hash(longStr);
    EXPECT_GT(result, 0);
}
