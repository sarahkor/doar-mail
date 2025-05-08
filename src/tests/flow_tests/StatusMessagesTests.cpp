#include <gtest/gtest.h>
#include "AddURLCommand.h"
#include "CheckURLCommand.h"
#include "DeleteURLCommand.h"
#include "Blacklist.h"
#include "BloomFilter.h"

class InMemoryStorage : public IUrlStorage {
public:
    std::set<std::string> urls;
    bool load(std::set<std::string>& out) override {
        out = urls;
        return true;
    }
    bool save(const std::set<std::string>& in) override {
        urls = in;
        return true;
    }
};

TEST(CommandOutputTests, AddURL_Valid_Returns201) {
    auto storage = std::make_unique<InMemoryStorage>();
    Blacklist blacklist(std::move(storage));
    BloomFilter bloom(128, {}, nullptr);
    AddURLCommand cmd(&bloom, &blacklist);

    std::string response = cmd.execute("www.example.com");
    EXPECT_EQ(response, "201 Created\n");
}

TEST(CommandOutputTests, CheckURL_AddedButNotBlacklisted_ReturnsTrueFalse) {
    auto storage = std::make_unique<InMemoryStorage>();
    Blacklist blacklist(std::move(storage));
    BloomFilter bloom(128, {}, nullptr);
    bloom.add("www.test.com");

    CheckURLCommand cmd(&bloom, &blacklist);
    std::string response = cmd.execute("www.test.com");
    EXPECT_EQ(response, "200 OK\n\ntrue false\n");
}

TEST(CommandOutputTests, CheckURL_AddedAndBlacklisted_ReturnsTrueTrue) {
    auto storage = std::make_unique<InMemoryStorage>();
    Blacklist blacklist(std::move(storage));
    BloomFilter bloom(128, {}, nullptr);

    bloom.add("www.bad.com");
    blacklist.add("www.bad.com");

    CheckURLCommand cmd(&bloom, &blacklist);
    std::string response = cmd.execute("www.bad.com");
    EXPECT_EQ(response, "200 OK\n\ntrue true\n");
}

TEST(CommandOutputTests, AddURL_Empty_Returns400) {
    auto storage = std::make_unique<InMemoryStorage>();
    Blacklist blacklist(std::move(storage));
    BloomFilter bloom(128, {}, nullptr);

    AddURLCommand cmd(&bloom, &blacklist);
    EXPECT_EQ(cmd.execute(""), "400 Bad Request\n");
}

