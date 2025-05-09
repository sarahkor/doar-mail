#include "main/commands/ConsoleMenu.h"
#include "main/commands/CommandParser.h"
#include "main/commands/AddURLCommand.h"
#include "main/commands/CheckURLCommand.h"
#include "main/commands/DeleteURLCommand.h"
#include "main/app/App.h"
#include "core/Blacklist.h"
#include "core/BloomFilter.h"
#include "core/FileLineStorage.h"
#include "core/BinaryFileStorage.h"
#include "core/ConfigurableHash.h"
#include "core/IHashFunction.h"
#include "utils/SetupParser.h"
#include "server/Server.h"

#include <map>
#include <string>
#include <memory>
#include <iostream>

int main(int argc, char* argv[]) {
    // parse command-line arguments and exit if its not valid
    int port, bloomSize;
    std::vector<int> hashRepeats;
    if (!SetupParser::Parse(argc, argv, port, bloomSize, hashRepeats)) {
        return 1;
    }
    std::istream* inStream = &std::cin;
    std::ostream* outStream = &std::cout;
    IMenu* menu = new ConsoleMenu(*inStream, *outStream);

    // Use FileLineStorage to load/save urls.txt.
    auto urlStorage = std::make_unique<FileLineStorage>("data/urlsdata.txt");
    //set up blacklist
    Blacklist* blacklist = new Blacklist(std::move(urlStorage));

    // Set up the Bloom filter
    std::vector<std::shared_ptr<IHashFunction>> hashFunctions;
    for (int repeat : hashRepeats) {
        hashFunctions.push_back(std::make_shared<ConfigurableHash>("std", repeat));
    }

    auto bloomStorage = std::make_unique<BinaryFileStorage>("data/bloomfilterdata.bin");
    BloomFilter* bloomFilter = new BloomFilter(bloomSize, hashFunctions, std::move(bloomStorage));

    //set up commands map
    std::map<std::string, ICommand*> commands;
    //the types of commands used in the program
    ICommand* addUrl = new AddURLCommand(bloomFilter, blacklist);
    ICommand* checkUrl = new CheckURLCommand(bloomFilter, blacklist);
    ICommand* deleteUrl = new DeleteURLCommand(bloomFilter, blacklist);

    //mapping the commands.
    commands["POST"] = addUrl;
    commands["GET"] = checkUrl;
    commands["DELETE"] = deleteUrl;

    
    Server server(menu, commands, port);
    server.run();

    delete menu;
    delete blacklist;
    delete bloomFilter;
    delete addUrl;
    delete checkUrl;
    delete deleteUrl;

    return 0;
}