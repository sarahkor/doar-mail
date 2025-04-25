#include "main/app/App.h"
#include "main/commands/CommandParser.h"
#include "main/commands/ICommand.h"
#include "core/BloomFilter.h"
#include "core/ConfigurableHash.h"
#include "core/IHashFunction.h"
#include "core/BinaryFileStorage.h"

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

void App::run() {
    int bloomSize;
    std::vector<int> hashRepeats;
 
    /*  
        first infinite loop that stop only if a bloom filter setup line was recieved (somthimg like 8 2 1)
        if the line is empty we ignore it, if the line doesnt match the bloom filter setup format we ignore as well
        if the line is the bloom filter set up we break the infinite loop, set up the bloom filter
        and move on to add and check urls.
    */
    while (true) {
        std::cout << "init bloom filter" << std::endl;
        std::string input = menu->nextCommand();
        if (input.empty()) continue;

        if (input == "q" || input == "quit") {
            return;
        }
        // the parser checks if the line is bloom filter set up line, if so it returns true and fill the bloomSize 
        // and the hashReaoeats with the right values
        if (parser->parseBloomFilterSetup(input, bloomSize, hashRepeats)) {
            break;
        }
    }

    std::vector<std::shared_ptr<IHashFunction>> hashFunctions;
    try {
        for (int repeat : hashRepeats) {
            hashFunctions.push_back(std::make_shared<ConfigurableHash>("std", repeat));
        }
    } catch (const std::invalid_argument& err) {
        std::cerr << "" << err.what() << std::endl;
    }

     // setting up the bloom filter and the data to be saved
    auto bloomStorage = std::make_unique<BinaryFileStorage>("data/bloomfilterdata.bin");
    *bloomFilter = new BloomFilter(bloomSize, hashFunctions, std::move(bloomStorage));

    /*
        in this loop we parse one line each time, if the line is empty we ignore, if the line is not empty
        we check using the parser if the line is in the format <number> [URL] if so the parser will return true
        and we check if the command number exsits in the comaands map if it is, we execute the command,
        o.w we will go to catch and ignore. if the line is not in the right format the parser will return false 
        and we will ignore.
    */
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
