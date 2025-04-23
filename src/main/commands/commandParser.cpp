#include "CommandParser.h"
#include <string>

CommandParser::CommandParser(const std::map<std::string, ICommand*>& commands)
    : commands(commands) {}

bool CommandParser::parse(const std::string& input, std::string& keyOut, std::string& urlOut) {
    std::string key = "", url = "";
    int spaceCount = 0;
    std::string current = "";

    for (char ch : input) {
        if (ch == ' ') {
            if (!current.empty()) {
                if (spaceCount == 0) key = current;
                else if (spaceCount == 1) url = current;
                else return false; // too many parts
                current = "";
                ++spaceCount;
            }
        } else {
            current += ch;
        }
    }

    if (!current.empty()) {
        if (spaceCount == 0) key = current;
        else if (spaceCount == 1) url = current;
        else return false;
    }

    if (key.empty() || url.empty()) return false;

    // Check key is numeric
    for (char ch : key) {
        if (ch < '0' || ch > '9') return false;
    }

    keyOut = key;
    urlOut = url;
    return true;
}
