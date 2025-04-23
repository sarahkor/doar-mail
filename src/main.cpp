#include "ConsoleMenu.h"
#include "CommandParser.h"
#include "AddURLCommand.h"
#include "CheckURLCommand.h"
#include "Blacklist.h"
#include "App.h"
#include "BloomFilter.h"

#include <map>
#include <string>

int main() {
    // Step 1: Create shared components
    ConsoleMenu* menu = new ConsoleMenu();
    Blacklist* blacklist = new Blacklist();

    BloomFilter* bloomFilter = nullptr;  // declared but not constructed yet

    std::map<std::string, ICommand*> commands;

    // Pass bloomFilter by reference so that later assignment is visible
    ICommand* addUrl = new AddURLCommand(bloomFilter, blacklist);
    ICommand* checkUrl = new CheckURLCommand(bloomFilter, blacklist);

    commands["1"] = addUrl;
    commands["2"] = checkUrl;

    CommandParser* parser = new CommandParser(commands);

    // Step 2: Create App and run
    App app(menu, parser, commands, blacklist, &bloomFilter);
    app.run();

    // Cleanup (optional)
    delete menu;
    delete parser;
    delete blacklist;
    delete bloomFilter;
    delete addUrl;
    delete checkUrl;

    return 0;
}
