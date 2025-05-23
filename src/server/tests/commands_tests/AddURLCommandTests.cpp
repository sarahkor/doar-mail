#include <gtest/gtest.h>
#include "AddURLCommand.h"
#include "BloomFilter.h"
#include "Blacklist.h"
#include "FileLineStorage.h"
#include <sstream>

// ========== SANITY TESTS ==========

// Test that adding a valid URL correctly updates both BloomFilter and Blacklist
TEST(AddURLCommandSanity, AddsUrlSuccessfully) {
    std::ostringstream out;
    BloomFilter* bloom = new BloomFilter(64, {});
    Blacklist* blacklist = new Blacklist(std::make_unique<FileLineStorage>("dummy.txt"));

    AddURLCommand cmd(bloom, blacklist, out);
    cmd.execute("www.example.com");

    EXPECT_TRUE(bloom->contains("www.example.com"));
    EXPECT_TRUE(blacklist->check("www.example.com"));

    delete bloom;
    delete blacklist;
}

// Test that multiple adds of different URLs work without crashing
TEST(AddURLCommandSanity, MultipleAddsDoNotCrash) {
    std::ostringstream out;
    BloomFilter* bloom = new BloomFilter(64, {});
    Blacklist* blacklist = new Blacklist(std::make_unique<FileLineStorage>("dummy.txt"));

    AddURLCommand cmd(bloom, blacklist, out);
    cmd.execute("www.site1.com");
    cmd.execute("www.site2.com");

    EXPECT_TRUE(bloom->contains("www.site1.com"));
    EXPECT_TRUE(bloom->contains("www.site2.com"));
    EXPECT_TRUE(blacklist->check("www.site1.com"));
    EXPECT_TRUE(blacklist->check("www.site2.com"));

    delete bloom;
    delete blacklist;
}

// ========== NEGATIVE TESTS ==========

// Test that executing AddURLCommand with empty URL does not crash the system
TEST(AddURLCommandNegative, AddEmptyURL_NoCrash) {
    std::ostringstream out;
    BloomFilter* bloom = new BloomFilter(64, {});
    Blacklist* blacklist = new Blacklist(std::make_unique<FileLineStorage>("dummy.txt"));

    AddURLCommand cmd(bloom, blacklist, out);

    // Just execute with empty URL and make sure it doesn't crash
    EXPECT_NO_THROW(cmd.execute(""));

    delete bloom;
    delete blacklist;
}
