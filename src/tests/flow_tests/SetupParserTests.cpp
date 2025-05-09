#include <gtest/gtest.h>
#include "SetupParser.h"

TEST(ParseSetupTests, ValidArguments) {
    const char* argv[] = {"app", "8080", "128", "1", "2"};
    int port, bloomSize;
    std::vector<int> hashes;
    SetupParser parser;
    EXPECT_TRUE(parser.Parse(5, const_cast<char**>(argv), port, bloomSize, hashes));
    EXPECT_EQ(port, 8080);
    EXPECT_EQ(bloomSize, 128);
    EXPECT_EQ(hashes, std::vector<int>({1, 2}));
}

TEST(ParseSetupTests, TooFewArgumentsFails) {
    const char* argv[] = {"app", "8080", "128"};
    int port, bloomSize;
    std::vector<int> hashes;
    SetupParser parser;
    EXPECT_FALSE(parser.Parse(3, const_cast<char**>(argv), port, bloomSize, hashes));
}

TEST(ParseSetupTests, NonNumericPortFails) {
    const char* argv[] = {"app", "notaport", "128", "1"};
    int port, bloomSize;
    std::vector<int> hashes;
    SetupParser parser;
    EXPECT_FALSE(parser.Parse(4, const_cast<char**>(argv), port, bloomSize, hashes));
}

TEST(ParseSetupTests, NonNumericBloomSizeFails) {
    const char* argv[] = {"app", "8080", "abc", "1"};
    int port, bloomSize;
    std::vector<int> hashes;
    SetupParser parser;
    EXPECT_FALSE(parser.Parse(4, const_cast<char**>(argv), port, bloomSize, hashes));
}

TEST(ParseSetupTests, NonNumericHashFails) {
    const char* argv[] = {"app", "8080", "128", "a"};
    int port, bloomSize;
    std::vector<int> hashes;
    SetupParser parser;
    EXPECT_FALSE(parser.Parse(4, const_cast<char**>(argv), port, bloomSize, hashes));
}

TEST(ParseSetupTests, ZeroPortFails) {
    const char* argv[] = {"app", "0", "128", "1"};
    int port, bloomSize;
    std::vector<int> hashes;
    SetupParser parser;
    EXPECT_FALSE(parser.Parse(4, const_cast<char**>(argv), port, bloomSize, hashes));
}

TEST(ParseSetupTests, NegativePortFails) {
    const char* argv[] = {"app", "-1", "128", "1"};
    int port, bloomSize;
    std::vector<int> hashes;
    SetupParser parser;
    EXPECT_FALSE(parser.Parse(4, const_cast<char**>(argv), port, bloomSize, hashes));
}

TEST(ParseSetupTests, ZeroBloomFails) {
    const char* argv[] = {"app", "8080", "0", "1"};
    int port, bloomSize;
    std::vector<int> hashes;
    SetupParser parser;
    EXPECT_FALSE(parser.Parse(4, const_cast<char**>(argv), port, bloomSize, hashes));
}

TEST(ParseSetupTests, NegativeBloomFails) {
    const char* argv[] = {"app", "8080", "-128", "1"};
    int port, bloomSize;
    std::vector<int> hashes;
    SetupParser parser;
    EXPECT_FALSE(parser.Parse(4, const_cast<char**>(argv), port, bloomSize, hashes));
}

TEST(ParseSetupTests, ZeroHashRepeatFails) {
    const char* argv[] = {"app", "8080", "128", "0"};
    int port, bloomSize;
    std::vector<int> hashes;
    SetupParser parser;
    EXPECT_FALSE(parser.Parse(4, const_cast<char**>(argv), port, bloomSize, hashes));
}

TEST(ParseSetupTests, NegativeHashRepeatFails) {
    const char* argv[] = {"app", "8080", "128", "-1"};
    int port, bloomSize;
    std::vector<int> hashes;
    SetupParser parser;
    EXPECT_FALSE(parser.Parse(4, const_cast<char**>(argv), port, bloomSize, hashes));
}

TEST(ParseSetupTests, NumericMixedWithLettersHash) {
    const char* argv[] = {"app", "8080", "128", "1a3"};
    int port, bloomSize;
    std::vector<int> hashes;
    SetupParser parser;
    EXPECT_FALSE(parser.Parse(4, const_cast<char**>(argv), port, bloomSize, hashes));
}
TEST(ParseSetupTests, RealNumberHash) {
    const char* argv[] = {"app", "8080", "128", "1.5"};
    int port, bloomSize;
    std::vector<int> hashes;
    SetupParser parser;
    EXPECT_FALSE(parser.Parse(4, const_cast<char**>(argv), port, bloomSize, hashes));
}

TEST(ParseSetupTests, RealNumberBloomSize) {
    const char* argv[] = {"app", "8080", "12.8", "1"};
    int port, bloomSize;
    std::vector<int> hashes;
    SetupParser parser;
    EXPECT_FALSE(parser.Parse(4, const_cast<char**>(argv), port, bloomSize, hashes));
}
TEST(ParseSetupTests, RealNumberPort) {
    const char* argv[] = {"app", "808.5", "128", "1"};
    int port, bloomSize;
    std::vector<int> hashes;
    SetupParser parser;
    EXPECT_FALSE(parser.Parse(4, const_cast<char**>(argv), port, bloomSize, hashes));
}
TEST(ParseSetupTests, Port1024IsAccepted) {
    const char* argv[] = {"app", "1024", "128", "1"};
    int port, bloomSize;
    std::vector<int> hashes;
    SetupParser parser;
    EXPECT_TRUE(parser.Parse(4, const_cast<char**>(argv), port, bloomSize, hashes));
}

TEST(ParseSetupTests, Port65535IsAccepted) {
    const char* argv[] = {"app", "65535", "128", "1"};
    int port, bloomSize;
    std::vector<int> hashes;
    SetupParser parser;
    EXPECT_TRUE(parser.Parse(4, const_cast<char**>(argv), port, bloomSize, hashes));
}

TEST(ParseSetupTests, Port1023Fails) {
    const char* argv[] = {"app", "1023", "128", "1"};
    int port, bloomSize;
    std::vector<int> hashes;
    SetupParser parser;
    EXPECT_FALSE(parser.Parse(4, const_cast<char**>(argv), port, bloomSize, hashes));
}

TEST(ParseSetupTests, Port65536Fails) {
    const char* argv[] = {"app", "65536", "128", "1"};
    int port, bloomSize;
    std::vector<int> hashes;
    SetupParser parser;
    EXPECT_FALSE(parser.Parse(4, const_cast<char**>(argv), port, bloomSize, hashes));
}