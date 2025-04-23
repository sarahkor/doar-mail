#include "App.h"
#include "CommandParser.h"
#include "BloomFilter.h"
#include "ConfigurableHash.h"
#include "IHashFunction.h"
#include "ICommand.h"

#include <string>
#include <sstream>
#include <vector>
#include <iostream>
#include <memory>

App::App(IMenu* menu,
         CommandParser* parser,
         std::map<std::string, ICommand*>& commands,
         Blacklist* blacklist,
         BloomFilter** bloomFilterRef)
    : menu(menu), parser(parser), commands(commands), blacklist(blacklist), bloomFilter(bloomFilterRef) {}

bool App::parseBloomFilterSetup(const std::string& input, int& sizeOut, std::vector<int>& hashIdsOut) {
    std::istringstream iss(input);
    std::string token;
    std::vector<int> values;

    while (iss >> token) {
        for (char ch : token) {
            if (ch < '0' || ch > '9') return false;
        }
        values.push_back(std::stoi(token));
    }

    if (values.size() < 2) return false;

    sizeOut = values[0];
    hashIdsOut.assign(values.begin() + 1, values.end());
    return true;
}

void App::run() {
    int bloomSize;
    std::vector<int> hashRepeats;

    // Step 1: Wait for valid Bloom filter setup
    while (true) {
        std::cout << "init bloom filter" << std::endl;
        std::string input = menu->nextCommand();
        if (input.empty()) continue;

        if (input == "q" || input == "quit") {
            return;
        }

        if (parseBloomFilterSetup(input, bloomSize, hashRepeats)) {
            break;
        }
    }

    // Step 2: Build hash function list
    std::vector<std::shared_ptr<IHashFunction>> hashFns;
    for (int repeat : hashRepeats) {
        hashFns.push_back(std::make_shared<ConfigurableHash>("std", repeat));
    }

    // Step 3: Construct actual BloomFilter object and point the shared pointer to it
    *bloomFilter = new BloomFilter(bloomSize, hashFns, nullptr);

    // Step 4: Main input loop
    while (true) {
        std::cout << "enter 1 [url] to add url or 2 [url] to check if the url is already in" << std::endl;

        std::string input = menu->nextCommand();
        if (input.empty()) continue;

        if (input == "q" || input == "quit") {
            return;
        }

        std::string key, url;
        if (!parser->parse(input, key, url)) {
            std::cout << "invalid input" << std::endl;
            continue;
        }

        try {
            ICommand* command = commands.at(key);
            command->execute(url);
        } catch (...) {
            menu->displayError("sorry no can do");
        }
    }
}
