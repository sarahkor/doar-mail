#pragma once
#include <string>
#include <map>
#include "ICommand.h"

class CommandParser {
private:
    const std::map<std::string, ICommand*>& commands;

public:
    CommandParser(const std::map<std::string, ICommand*>& commands);
    bool parse(const std::string& input, std::string& keyOut, std::string& urlOut);
};