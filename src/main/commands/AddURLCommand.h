#pragma once
#include "ICommand.h"
#include "BloomFilter.h"
#include "Blacklist.h"

class AddURLCommand : public ICommand {
private:
    BloomFilter*& bloom;
    Blacklist* blacklist;

public:
    AddURLCommand(BloomFilter*& bloomRef, Blacklist* blacklist);
    void execute(const std::string& url) override;
};