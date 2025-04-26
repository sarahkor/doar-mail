#include "AddURLCommand.h"

AddURLCommand::AddURLCommand(BloomFilter*& bf, Blacklist* bl, std::ostream& outputStream)
    : bloom(bf), blacklist(bl), out(outputStream) {}
// method to add url. in order to add url to the system we need to add it to bloom filter and to blacklist
void AddURLCommand::execute(const std::string& url) {
    if (!bloom || !blacklist || url.empty()) { 
        return;
    }
    bloom->add(url);
    blacklist->add(url);
}

