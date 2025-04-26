#pragma once
#include "ICommand.h"
#include <ostream>
#include "core/BloomFilter.h"
#include "core/Blacklist.h"

class CheckURLCommand : public ICommand {
private:
    BloomFilter*& bloom; 
    Blacklist* blacklist;
    std::ostream& out;

public:
    CheckURLCommand(BloomFilter*& bf, Blacklist* bl, std::ostream& outputStream);
    void execute(const std::string& url) override;
};
