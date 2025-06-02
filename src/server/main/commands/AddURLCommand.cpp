#include "AddURLCommand.h"
#include "server/utils/StatusMessages.h"
#include "server/utils/Sync.h"

AddURLCommand::AddURLCommand(BloomFilter *bf, Blacklist *bl)
    : bloom(bf), blacklist(bl) {}

// method to add url. in order to add url to the system we need to add it to bloom filter and to blacklist
std::string AddURLCommand::execute(const std::string &url)
{
    if (!bloom || !blacklist || url.empty())
    {
        return StatusMessages::get(400);
    }
    std::lock_guard<std::mutex> lock(gDataMutex);
    bloom->add(url);
    blacklist->add(url);
    return StatusMessages::get(201);
}