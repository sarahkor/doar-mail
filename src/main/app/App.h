#ifndef APP_H
#define APP_H

#include "main/commands/IMenu.h"
#include "main/commands/ICommand.h"
#include "main/commands/CommandParser.h"
#include "core/Blacklist.h"
#include "core/BloomFilter.h"

#include <string>
#include <vector>
#include <map>

class App {
private:
    IMenu* menu;
    CommandParser* parser;
    std::map<std::string, ICommand*>& commands;
    Blacklist* blacklist;
    BloomFilter* bloomFilter;

public:
    // constructor.
    App(IMenu* menu,
    CommandParser* parser,
    std::map<std::string, ICommand*>& commands,
    Blacklist* blacklist,
    BloomFilter* bloomFilterRef);

    // method to run the application.
    void run();
};
#endif
