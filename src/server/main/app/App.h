#ifndef APP_H
#define APP_H

#include "server/main/commands/IMenu.h"
#include "server/main/commands/ICommand.h"
#include "server/main/commands/CommandParser.h"
#include "server/core/Blacklist.h"
#include "server/core/BloomFilter.h"

#include <string>
#include <vector>
#include <map>

class App
{
private:
    IMenu *menu;
    CommandParser *parser;
    std::map<std::string, ICommand *> &commands;
    Blacklist *blacklist;
    BloomFilter *bloomFilter;

public:
    // constructor.
    App(IMenu *menu,
        CommandParser *parser,
        std::map<std::string, ICommand *> &commands,
        Blacklist *blacklist,
        BloomFilter *bloomFilterRef);

    // method to run the application.
    void run();
};
#endif
