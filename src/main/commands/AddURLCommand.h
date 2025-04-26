#pragma once
#include "ICommand.h"
#include "core/BloomFilter.h"
#include "core/Blacklist.h"
#include <ostream>

class AddURLCommand : public ICommand {
private:
    BloomFilter*& bloom;
    Blacklist* blacklist;
    std::ostream& out;

public:
    AddURLCommand(BloomFilter*& bf, Blacklist* bl, std::ostream& outputStream);
    void execute(const std::string& url) override;
};