#include <gtest/gtest.h>
#include "Blacklist.h"
#include "FileLineStorage.h"

// ========== SANITY TESTS ==========

// Test that adding a URL to the blacklist allows finding it later
TEST(BlacklistSanity, AddAndCheckWorks) {
    Blacklist blacklist(std::make_unique<FileLineStorage>("dummy.txt"));
    blacklist.add("www.test.com");

    EXPECT_TRUE(blacklist.check("www.test.com"));
}

// ========== NEGATIVE TESTS ==========

// Test that checking a non-added URL returns false
TEST(BlacklistNegative, NotFoundReturnsFalse) {
    Blacklist blacklist(std::make_unique<FileLineStorage>("dummy.txt"));
    EXPECT_FALSE(blacklist.check("www.unknown.com"));
}

// Test that an empty string is not accidentally treated as a valid URL
TEST(BlacklistNegative, EmptyStringReturnsFalse) {
    Blacklist blacklist(std::make_unique<FileLineStorage>("dummy.txt"));
    EXPECT_FALSE(blacklist.check(""));
}

// ========== EDGE CASE TESTS ==========

// Test that adding an empty string does not crash and behaves safely
TEST(BlacklistEdge, AddEmptyStringAndCheck) {
    Blacklist blacklist(std::make_unique<FileLineStorage>("dummy.txt"));
    blacklist.add("");

    // Should still find it because we explicitly added an empty string
    EXPECT_TRUE(blacklist.check(""));
}

// Test that adding the same URL twice does not cause issues
TEST(BlacklistEdge, AddSameURLOneTwice) {
    Blacklist blacklist(std::make_unique<FileLineStorage>("dummy.txt"));
    blacklist.add("www.test.com");
    blacklist.add("www.test.com");

    EXPECT_TRUE(blacklist.check("www.test.com"));
}
