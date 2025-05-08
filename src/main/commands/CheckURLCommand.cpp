#include "CheckURLCommand.h"
#include "utils/StatusMessages.h"

CheckURLCommand::CheckURLCommand(BloomFilter* bf, Blacklist* bl)
    : bloom(bf), blacklist(bl) {}

/*
 *  in this method we check if the url is in the system, in order to do so we need to first check the 
 *  bloom filter, if the bloom filter returns false the url is for sure not in the system, how ever the bloom filter
 *  might have false positives, so if the bloom filter ruterns true we need to valditate in in front of
 *  the actuals blacklisted urls, if the url is not in the blacklist then its not in system and if it is then its in the system.
 */ 
std::string CheckURLCommand::execute(const std::string& url) {
    if (!bloom || !blacklist || url.empty()) {
        return StatusMessages::get(400);
    }
    std::string status = StatusMessages::get(200);
    // we check if the bloom filter contains the url, if not we return false
    if (!bloom->contains(url)) {
        return status + "false\n";
    }
    // o.w we print true and then check if the url is in the blacklist, if so we print true if not we print false.
    return status + std::string("true ") + (blacklist->check(url) ? "true" : "false") + "\n";
}