#include "DeleteURLCommand.h"
#include "utils/StatusMessages.h"

DeleteURLCommand::DeleteURLCommand(BloomFilter* bf, Blacklist* bl)
    : bloom(bf), blacklist(bl) {}

std::string DeleteURLCommand::execute(const std::string& url) {
    if (!bloom || !blacklist || url.empty()) {
        return StatusMessages::get(400);
    }

    if (!blacklist->remove(url)) {
        return StatusMessages::get(404);
    }

    return StatusMessages::get(204);
}