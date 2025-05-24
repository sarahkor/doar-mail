#ifndef DELETE_URL_COMMAND_H
#define DELETE_URL_COMMAND_H
#include "ICommand.h"
#include "server/core/BloomFilter.h"
#include "server/core/Blacklist.h"
#include <string>

class DeleteURLCommand : public ICommand
{
private:
    BloomFilter *bloom;
    Blacklist *blacklist;

public:
    DeleteURLCommand(BloomFilter *bf, Blacklist *bl);
    std::string execute(const std::string &url) override;
};
#endif // DELETE_URL_COMMAND_H