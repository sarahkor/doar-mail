#include "App.h"
#include "main/commands/CommandParser.h"
#include "main/commands/ICommand.h"
#include "core/BloomFilter.h"
#include "core/ConfigurableHash.h"
#include "core/IHashFunction.h"
#include "core/BinaryFileStorage.h"
#include "utils/StatusMessages.h"

#include <string>
#include <sstream>
#include <vector>
#include <iostream>
#include <memory>

App::App(IMenu* menu,
         CommandParser* parser,
         std::map<std::string, ICommand*>& commands,
         Blacklist* blacklist,
         BloomFilter* bloomFilterRef)
    : menu(menu), parser(parser), commands(commands), blacklist(blacklist), bloomFilter(bloomFilterRef) {}

void App::run() {
    /*
     * in this loop we parse one line each time, if the line is empty we ignore, if the line is not empty
     * we check using the parser if the line is in the format <number> [URL] if so the parser will return true
     * and we check if the command number exsits in the comaands map if it is, we execute the command,
     * o.w we will go to catch and ignore. if the line is not in the right format the parser will return false 
     * and we will ignore.
     */
    while (true) {

        std::string input = menu->nextCommand();
        if (input.empty()) {
            std::cout << StatusMessages::get(400);
            continue;
        }

        std::string key, url;
        if (!parser->parse(input, key, url)) {
            std::cout << StatusMessages::get(400);
            continue;
        }

        try {
            ICommand* command = commands.at(key);
            std::string result = command->execute(url);
            std::cout << result;
        } catch (...) {
           std::cout << StatusMessages::get(400);
        }
    }
}
