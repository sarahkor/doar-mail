#include "CheckURLCommand.h"
#include <iostream>

CheckURLCommand::CheckURLCommand(BloomFilter*& bloomRef, Blacklist* bl)
    : bloom(bloomRef), blacklist(bl) {}

void CheckURLCommand::execute(const std::string& url) {
    if (!bloom) {
        std::cerr << "Bloom filter is not initialized yet." << std::endl;
        return;
    }

    if (!bloom->contains(url)) {
        std::cout << "false" << std::endl;
        return;
    }

    std::cout << "true " << (blacklist->check(url) ? "true" : "false") << std::endl;
}
