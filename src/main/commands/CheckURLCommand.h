#pragma once

#include "ICommand.h"
#include "BloomFilter.h"
#include "Blacklist.h"

class CheckURLCommand : public ICommand {
private:
    BloomFilter*& bloom;      // Reference to the shared pointer
    Blacklist* blacklist;

public:
    CheckURLCommand(BloomFilter*& bloomRef, Blacklist* blacklist);
    void execute(const std::string& url) override;
};
