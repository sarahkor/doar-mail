#include <gtest/gtest.h>
#include "CommandParser.h"
#include "ICommand.h"
#include <map>
#include <vector>
#include <string>

class DummyCommand : public ICommand {
public:
    void execute(const std::string&) override {}
};

// ========== SANITY TESTS ==========

// Test that a valid command with URL is parsed correctly
TEST(CommandParserSanity, ValidParseCommand) {
    DummyCommand dummy;
    std::map<std::string, ICommand*> commands = {{"1", &dummy}};
    CommandParser parser(commands);

    std::string key, url;
    EXPECT_TRUE(parser.parse("1 www.example.com", key, url));
    EXPECT_EQ(key, "1");
    EXPECT_EQ(url, "www.example.com");
}

// Test that a valid bloom filter setup line is parsed correctly
TEST(CommandParserSanity, ValidBloomSetupLine) {
    DummyCommand dummy;
    CommandParser parser({{"1", &dummy}});
    int bloomSize;
    std::vector<int> hashes;
    EXPECT_TRUE(parser.parseBloomFilterSetup("128 1 2 3", bloomSize, hashes));
    EXPECT_EQ(bloomSize, 128);
    EXPECT_EQ(hashes, std::vector<int>({1, 2, 3}));
}

// Test that extra spaces between command and URL are ignored
TEST(CommandParserSanity, ValidCommandNumber_ButIgnoresExtraSpaces) {
    DummyCommand dummy;
    std::map<std::string, ICommand*> commands = {{"4", &dummy}};
    CommandParser parser(commands);

    std::string key, url;
    EXPECT_TRUE(parser.parse("4      www.example.com", key, url));
    EXPECT_EQ(key, "4");
    EXPECT_EQ(url, "www.example.com");
}

// ========== NEGATIVE TESTS ==========

// Test that a missing URL after the command number fails
TEST(CommandParserNegative, InvalidCommandMissingUrl) {
    DummyCommand dummy;
    CommandParser parser({{"1", &dummy}});
    std::string key, url;
    EXPECT_FALSE(parser.parse("1", key, url));
}

// Test that non-numeric command keys fail
TEST(CommandParserNegative, InvalidNonNumericCommand) {
    DummyCommand dummy;
    CommandParser parser({{"1", &dummy}});
    std::string key, url;
    EXPECT_FALSE(parser.parse("abc www.example.com", key, url));
}

// Test that bloom filter setup with zero size fails
TEST(CommandParserNegative, InvalidBloomSetupZeroSize) {
    DummyCommand dummy;
    CommandParser parser({{"1", &dummy}});
    int bloomSize;
    std::vector<int> hashes;
    EXPECT_FALSE(parser.parseBloomFilterSetup("0 1 2", bloomSize, hashes));
}

// Test that using "0" as a command number fails
TEST(CommandParserNegative, ZeroAsCommandFails) {
    DummyCommand dummy;
    std::map<std::string, ICommand*> commands = {{"1", &dummy}};
    CommandParser parser(commands);

    std::string key, url;
    EXPECT_FALSE(parser.parse("0 www.example.com", key, url));
}

// Test that using a negative number as command fails
TEST(CommandParserNegative, NegativeCommandFails) {
    DummyCommand dummy;
    std::map<std::string, ICommand*> commands = {{"1", &dummy}};
    CommandParser parser(commands);

    std::string key, url;
    EXPECT_FALSE(parser.parse("-1 www.example.com", key, url));
}

// Test that invalid URLs without domain format fail
TEST(CommandParserNegative, InvalidURLFails) {
    DummyCommand dummy;
    std::map<std::string, ICommand*> commands = {{"1", &dummy}};
    CommandParser parser(commands);

    std::string key, url;
    EXPECT_FALSE(parser.parse("1 example", key, url));
}

// Test that bloom filter setup with zero repeat count fails
TEST(CommandParserNegative, BloomSetupZeroInRepeatFails) {
    DummyCommand dummy;
    CommandParser parser({{"1", &dummy}});
    int bloomSize;
    std::vector<int> hashes;

    EXPECT_FALSE(parser.parseBloomFilterSetup("8 0 1", bloomSize, hashes));
}

// Test that bloom filter setup with negative repeat count fails
TEST(CommandParserNegative, NegativeRepeatFailsInBloomFilterSetup) {
    DummyCommand dummy;
    CommandParser parser({{"1", &dummy}});
    int bloomSize;
    std::vector<int> hashes;

    EXPECT_FALSE(parser.parseBloomFilterSetup("8 -1 2", bloomSize, hashes));
}

// Test that bloom filter setup with negative size fails
TEST(CommandParserNegative, NegativeBloomSizeFails) {
    DummyCommand dummy;
    CommandParser parser({{"1", &dummy}});
    int bloomSize;
    std::vector<int> hashes;

    EXPECT_FALSE(parser.parseBloomFilterSetup("-8 1 2", bloomSize, hashes));
}

// Test that non-numeric tokens inside bloom filter setup fail
TEST(CommandParserNegative, NonNumericTokenFailsInBloomSetup) {
    DummyCommand dummy;
    CommandParser parser({{"1", &dummy}});
    int bloomSize;
    std::vector<int> hashes;

    EXPECT_FALSE(parser.parseBloomFilterSetup("8 a 2", bloomSize, hashes));
}

// Test that non-numeric command key fails
TEST(CommandParserNegative, NonNumericTokenFailsInCommand) {
    DummyCommand dummy;
    CommandParser parser({{"1", &dummy}});
    std::string key, url;

    EXPECT_FALSE(parser.parse("one www.example.com", key, url));
}

// Test that input with only spaces fails
TEST(CommandParserNegative, OnlySpacesInCommandFails) {
    DummyCommand dummy;
    std::map<std::string, ICommand*> commands = {{"1", &dummy}};
    CommandParser parser(commands);

    std::string key, url;
    EXPECT_FALSE(parser.parse("     ", key, url));
}

// Test that empty input string fails
TEST(CommandParserNegative, EmptyInputFails) {
    DummyCommand dummy;
    std::map<std::string, ICommand*> commands = {{"1", &dummy}};
    CommandParser parser(commands);

    std::string key, url;
    EXPECT_FALSE(parser.parse("", key, url));
}

// ========== EDGE CASE TESTS ==========

// Test that extra spaces around command line are handled
TEST(CommandParserEdge, ExtraSpacesHandled_Command) {
    DummyCommand dummy;
    std::map<std::string, ICommand*> commands = {{"1", &dummy}};
    CommandParser parser(commands);

    std::string key, url;
    EXPECT_TRUE(parser.parse("  1     www.example.com  ", key, url));
    EXPECT_EQ(key, "1");
    EXPECT_EQ(url, "www.example.com");
}

// Test that extra spaces inside bloom filter setup line are handled
TEST(CommandParserEdge, ExtraSpacesHandled_BloomSetup) {
    DummyCommand dummy;
    CommandParser parser({{"1", &dummy}});
    int bloomSize;
    std::vector<int> hashes;

    EXPECT_TRUE(parser.parseBloomFilterSetup("8   1      2", bloomSize, hashes));
    EXPECT_EQ(bloomSize, 8);
    EXPECT_EQ(hashes, std::vector<int>({1, 2}));
}

// ========== BOUNDARY TESTS ==========

// Test that extremely large bloom filter size is parsed correctly
TEST(CommandParserBoundary, VeryLargeBloomSize) {
    DummyCommand dummy;
    CommandParser parser({{"1", &dummy}});
    int bloomSize;
    std::vector<int> hashes;

    EXPECT_TRUE(parser.parseBloomFilterSetup("1000000 1 2", bloomSize, hashes));
    EXPECT_EQ(bloomSize, 1000000);
}
