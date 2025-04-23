#pragma once

#include "IMenu.h"
#include "ICommand.h"
#include "CommandParser.h"
#include "Blacklist.h"
#include "BloomFilter.h"
#include <map>
#include <string>
#include <vector>

class App {
private:
    IMenu* menu;
    CommandParser* parser;
    std::map<std::string, ICommand*>& commands;
    Blacklist* blacklist;
    BloomFilter** bloomFilter;

    bool parseBloomFilterSetup(const std::string& input, int& sizeOut, std::vector<int>& hashIdsOut);

public:
    App(IMenu* menu,
    CommandParser* parser,
    std::map<std::string, ICommand*>& commands,
    Blacklist* blacklist,
    BloomFilter** bloomFilterRef);

    void run();
};
