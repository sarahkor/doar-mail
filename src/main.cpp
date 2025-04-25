#include "main/commands/ConsoleMenu.h"
#include "main/commands/CommandParser.h"
#include "main/commands/AddURLCommand.h"
#include "main/commands/CheckURLCommand.h"
#include "main/app/App.h"
#include "core/Blacklist.h"
#include "core/BloomFilter.h"
#include "core/FileLineStorage.h"

#include <map>
#include <string>
#include <memory>
#include <iostream>


int main() {
    std::istream* inStream = &std::cin;
    std::ostream* outStream = &std::cout;

    IMenu* menu = new ConsoleMenu(*inStream, *outStream);

    // Use FileLineStorage to load/save urls.txt
    auto urlStorage = std::make_unique<FileLineStorage>("data/urlsdata.txt");
    Blacklist* blacklist = new Blacklist(std::move(urlStorage));

    // the bloom filter is declared but not constructed yet because we need
    // the bloom filter setup line that we will get only in app.run()
    BloomFilter* bloomFilter = nullptr; 
    std::map<std::string, ICommand*> commands;

    //the types of commands used in the program
    ICommand* addUrl = new AddURLCommand(bloomFilter, blacklist, *outStream);
    ICommand* checkUrl = new CheckURLCommand(bloomFilter, blacklist, *outStream);

    //mapping the commands.
    commands["1"] = addUrl;
    commands["2"] = checkUrl;

    CommandParser* parser = new CommandParser(commands);

    App app(menu, parser, commands, blacklist, &bloomFilter);
    app.run();

    delete menu;
    delete parser;
    delete blacklist;
    delete bloomFilter;
    delete addUrl;
    delete checkUrl;

    return 0;
}
