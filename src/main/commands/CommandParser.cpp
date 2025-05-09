#include "CommandParser.h"
#include <sstream>
#include <regex>
#include <stdexcept>

//constructor
CommandParser::CommandParser(const std::map<std::string, ICommand*>& commands)
    : commands(commands) {}

// this method parses commands in the format: <command> [URL].
// extracts the command key and URL, and validates format and key,
// returns true if valid and fills keyOut/urlOut, false otherwise
bool CommandParser::parse(const std::string& input, std::string& keyOut, std::string& urlOut) {
    std::string key, url, current;
    int spaceCount = 0;

     //this for loop iterates over the chars in the input
    for (char ch : input) {
        // if the char is space it means a token ended
        if (ch == ' ') {
            // if the token is not empty (skips multipule spaces)
            if (!current.empty()) {
                if (spaceCount == 0) key = current; // first token is command key
                else if (spaceCount == 1) url = current; // second token is URL
                else return false; // more then 2 tokens is invalid input
                current.clear();
                spaceCount++;
            }
        // build the current token
        } else {
            current += ch;
        }
    }
    // for the final token
    if (!current.empty()) {
        if (spaceCount == 0) key = current;
        else if (spaceCount == 1) url = current;
        else return false;
    }

     // must have exactly one command and one URL
    if (key.empty() || url.empty()) return false;

    // check that the url is in URL format using regex
    std::regex urlRegex(R"(^((https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z0-9]{2,})(\/\S*)?$)");
    if (!std::regex_match(url, urlRegex)) return false;

    keyOut = key;
    urlOut = url;
    return true;
}