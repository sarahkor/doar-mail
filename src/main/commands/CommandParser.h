#pragma once
#include <string>
#include <map>
#include <vector>

#include "ICommand.h"


class CommandParser {
private:
    const std::map<std::string, ICommand*>& commands;

public:
    CommandParser(const std::map<std::string, ICommand*>& commands);
    bool parseBloomFilterSetup(const std::string& input, int& sizeOut, std::vector<int>& hashIdsOut);
    bool parse(const std::string& input, std::string& keyOut, std::string& urlOut);
};