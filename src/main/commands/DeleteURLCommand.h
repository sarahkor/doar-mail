#pragma once
#include "ICommand.h"
#include "core/BloomFilter.h"
#include "core/Blacklist.h"
#include <string>

class DeleteURLCommand : public ICommand {
private:
    BloomFilter*& bloom;
    Blacklist* blacklist;

public:
    DeleteURLCommand(BloomFilter*& bf, Blacklist* bl);
    std::string execute(const std::string& url) override;
};