#ifndef COMMAND_PARSER_H
#define COMMAND_PARSER_H

#include <string>
#include <map>
#include "ICommand.h"

class CommandParser {
private:
    const std::map<std::string, ICommand*>& commands;
    std::string lastParsedUrl;

public:
    // Constructor
    CommandParser(const std::map<std::string, ICommand*>& commands);

    // Parses input like "<number> [url]" and returns success/failure
    bool parse(const std::string& input, std::string& keyOut, std::string& urlOut);

    // Parses and returns the ICommand* associated with the command key
    ICommand* parse(const std::string& input);

    // Returns the last parsed URL
    const std::string& getLastParsedUrl() const;
};

#endif // COMMAND_PARSER_H
