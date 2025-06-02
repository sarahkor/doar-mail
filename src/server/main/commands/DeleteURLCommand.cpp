#include "DeleteURLCommand.h"
#include "server/utils/StatusMessages.h"
#include "server/utils/Sync.h"

DeleteURLCommand::DeleteURLCommand(BloomFilter *bf, Blacklist *bl)
    : bloom(bf), blacklist(bl) {}

std::string DeleteURLCommand::execute(const std::string &url)
{
    if (!bloom || !blacklist || url.empty())
    {
        return StatusMessages::get(400);
    }

    std::lock_guard<std::mutex> lock(gDataMutex);
    if (!blacklist->remove(url))
    {
        return StatusMessages::get(404);
    }

    return StatusMessages::get(204);
}