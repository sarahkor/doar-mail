#include "AddURLCommand.h"

AddURLCommand::AddURLCommand(BloomFilter*& bf, Blacklist* bl, std::ostream& outputStream)
    : bloom(bf), blacklist(bl), out(outputStream) {}
// method to add url. in order to add url to the system we need to add it to bloom filter and to blacklist
void AddURLCommand::execute(const std::string& url) {
    // adding url to bloom filter
    if (bloom) {
        bloom->add(url);
    } else {
        out << "BloomFilter not initialized yet" << std::endl;
    }
    // adding url to blacklist
    if (blacklist) {
        blacklist->add(url);
    } else {
        out << "blacklist not initialized yet" << std::endl;
    }
}

