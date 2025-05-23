#include <gtest/gtest.h>
#include "CheckURLCommand.h"
#include "BloomFilter.h"
#include "Blacklist.h"
#include "FileLineStorage.h"
#include <sstream>

// ========== SANITY TESTS ==========

// Test that if URL exists in both BloomFilter and Blacklist, output is "true true"
TEST(CheckURLCommandSanity, CheckUrlExists) {
    std::ostringstream out;
    BloomFilter* bloom = new BloomFilter(64, {});
    Blacklist* blacklist = new Blacklist(std::make_unique<FileLineStorage>("dummy.txt"));
    bloom->add("www.example.com");
    blacklist->add("www.example.com");

    CheckURLCommand cmd(bloom, blacklist, out);
    cmd.execute("www.example.com");

    EXPECT_TRUE(out.str().find("true true") != std::string::npos);

    delete bloom;
    delete blacklist;
}

// Test that if URL is missing from BloomFilter, output is "false"
TEST(CheckURLCommandNegative, URLNotInBloomFilter) {
    std::ostringstream out;
    BloomFilter* bloom = new BloomFilter(64, {});
    Blacklist* blacklist = new Blacklist(std::make_unique<FileLineStorage>("dummy.txt"));

    CheckURLCommand cmd(bloom, blacklist, out);
    cmd.execute("www.unknown.com");  // URL not added anywhere

    EXPECT_TRUE(out.str().find("false") != std::string::npos);

    delete bloom;
    delete blacklist;
}

// Test that if URL is found in BloomFilter but not in Blacklist (false positive), output is "true false"
TEST(CheckURLCommandSanity, BloomPositiveBlacklistNegative) {
    std::ostringstream out;
    BloomFilter* bloom = new BloomFilter(64, {});
    Blacklist* blacklist = new Blacklist(std::make_unique<FileLineStorage>("dummy.txt"));
    bloom->add("www.falsepositive.com");  // only added to Bloom, not to Blacklist

    CheckURLCommand cmd(bloom, blacklist, out);
    cmd.execute("www.falsepositive.com");

    EXPECT_TRUE(out.str().find("true false") != std::string::npos);

    delete bloom;
    delete blacklist;
}
