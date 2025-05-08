#include "CommandParser.h"
#include <sstream>
#include <regex>
#include <stdexcept>

CommandParser::CommandParser(const std::map<std::string, ICommand*>& commands)
    : commands(commands) {}

bool CommandParser::parse(const std::string& input, std::string& keyOut, std::string& urlOut) {
    std::string key, url, current;
    int spaceCount = 0;

    for (char ch : input) {
        if (ch == ' ') {
            if (!current.empty()) {
                if (spaceCount == 0) key = current;
                else if (spaceCount == 1) url = current;
                else return false;
                current.clear();
                spaceCount++;
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

    std::regex urlRegex(R"(^((https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z0-9]{2,})(\/\S*)?$)");
    if (!std::regex_match(url, urlRegex)) return false;

    keyOut = key;
    urlOut = url;
    return true;
}

ICommand* CommandParser::parse(const std::string& input) {
    std::string key, url;
    if (!parse(input, key, url)) {
        throw std::invalid_argument("400");
    }

    auto it = commands.find(key);
    if (it == commands.end()) {
        throw std::invalid_argument("404");
    }

    lastParsedUrl = url;
    return it->second;
}

const std::string& CommandParser::getLastParsedUrl() const {
    return lastParsedUrl;
}
