#pragma once
#include "ICommand.h"
#include "core/BloomFilter.h"
#include "core/Blacklist.h"
#include <string>

class AddURLCommand : public ICommand {
private:
    BloomFilter* bloom;
    Blacklist* blacklist;

public:
    AddURLCommand(BloomFilter* bf, Blacklist* bl);
    std::string execute(const std::string& url) override;
};