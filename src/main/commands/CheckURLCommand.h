#ifndef CHECK_URL_COMMAND_H
#define CHECK_URL_COMMAND_H
#include "ICommand.h"
#include "core/BloomFilter.h"
#include "core/Blacklist.h"
#include <string>

class CheckURLCommand : public ICommand {
private:
    BloomFilter* bloom;
    Blacklist* blacklist;

public:
    CheckURLCommand(BloomFilter* bf, Blacklist* bl);
    std::string execute(const std::string& url) override;
};
#endif

