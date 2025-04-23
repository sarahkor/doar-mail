#include "AddURLCommand.h"
#include <iostream>

AddURLCommand::AddURLCommand(BloomFilter*& bloomRef, Blacklist* bl)
    : bloom(bloomRef), blacklist(bl) {}

void AddURLCommand::execute(const std::string& url) {
    if (bloom) {
        bloom->add(url);
        blacklist->add(url);
        std::cout << "added url" << std::endl;
    } else {
        std::cerr << "BloomFilter not initialized yet" << std::endl;
    }
}

