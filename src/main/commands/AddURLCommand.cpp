#include "AddURLCommand.h"
#include "utils/StatusMessages.h"

AddURLCommand::AddURLCommand(BloomFilter* bf, Blacklist* bl)
    : bloom(bf), blacklist(bl) {}

// method to add url. in order to add url to the system we need to add it to bloom filter and to blacklist
std::string AddURLCommand::execute(const std::string& url) {
    if (!bloom || !blacklist || url.empty()) {
        return StatusMessages::get(400);
    }
    bloom->add(url);
    blacklist->add(url);
    return StatusMessages::get(201);
}