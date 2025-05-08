#include <gtest/gtest.h>
#include "DeleteURLCommand.h"
#include "Blacklist.h"
#include "BloomFilter.h"

class DummyStorage : public IUrlStorage {
public:
    bool load(std::set<std::string>& urls) override {
        urls.insert("www.toremove.com");
        return true;
    }
    bool save(const std::set<std::string>&) override { return true; }
};

TEST(DeleteURLCommandTests, DeletesExistingURL_Returns204) {
    auto storage = std::make_unique<DummyStorage>();
    Blacklist blacklist(std::move(storage));
    BloomFilter bloom(64, {}, nullptr);
    DeleteURLCommand cmd(&bloom, &blacklist);

    std::string response = cmd.execute("www.toremove.com");
    EXPECT_EQ(response, "204 No Content\n");
}

TEST(DeleteURLCommandTests, DeleteNonexistentURL_Returns404) {
    auto storage = std::make_unique<DummyStorage>();
    Blacklist blacklist(std::move(storage));
    BloomFilter bloom(64, {}, nullptr);
    DeleteURLCommand cmd(&bloom, &blacklist);

    std::string response = cmd.execute("www.unknown.com");
    EXPECT_EQ(response, "404 Not Found\n");
}

TEST(DeleteURLCommandTests, EmptyURL_Returns400) {
    auto storage = std::make_unique<DummyStorage>();
    Blacklist blacklist(std::move(storage));
    BloomFilter bloom(64, {}, nullptr);
    DeleteURLCommand cmd(&bloom, &blacklist);

    std::string response = cmd.execute("");
    EXPECT_EQ(response, "400 Bad Request\n");
}
