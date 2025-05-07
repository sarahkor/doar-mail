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

#include <map>
#include <string>
#include <memory>
#include <iostream>

bool ParseSetup(int argc, char* argv[], int& port, int& bloomSize, std::vector<int>& hashRepeats);

int main(int argc, char* argv[]) {
    // parse command-line arguments and exit if its not valid
    int port, bloomSize;
    std::vector<int> hashRepeats;
    if (!ParseSetup(argc, argv, port, bloomSize, hashRepeats)) {
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

    CommandParser* parser = new CommandParser(commands);
    
    App app(menu, parser, commands, blacklist, bloomFilter);
    app.run();

    delete menu;
    delete parser;
    delete blacklist;
    delete bloomFilter;
    delete addUrl;
    delete checkUrl;
    delete deleteUrl;

    return 0;
}
bool ParseSetup(int argc, char* argv[], int& port, int& bloomSize, std::vector<int>& hashRepeats) {
    if (argc < 4) {
        return false; // not enough args: need program name, port, bloom size, and at least one hash
    }
    std::vector<int> values;

    // Iterate over all args from argv[1] onward
    for (int i = 1; i < argc; i++) {
        std::string token = argv[i];
        // check that all chars are digits
        for (char ch : token) {
            if (ch < '0' || ch > '9') {
                return false; // invalid character
            }
        }
        // convert to int and store
        values.push_back(std::stoi(token));
    }

    port = values[0];
    bloomSize = values[1];

    if (port <= 0 || bloomSize <= 0) {
        return false; // port and size must be positive
    }

    // extract hash repeat counts (must be ≥1)
    hashRepeats.assign(values.begin() + 2, values.end());
    for (int repeat : hashRepeats) {
        if (repeat <= 0) return false;
    }

    return !hashRepeats.empty(); // make sure we have at least one hash function
}