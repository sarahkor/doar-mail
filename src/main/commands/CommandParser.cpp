#include "CommandParser.h"
#include <string>
#include <sstream>
#include <regex>
#include <vector>

//constructor
CommandParser::CommandParser(const std::map<std::string, ICommand*>& commands)
    : commands(commands) {}
// this method parses commands in the format: <nunber> [URL].
// extracts the command key and URL, and validates format and key
bool CommandParser::parse(const std::string& input, std::string& keyOut, std::string& urlOut) {

    //these two strings will store the final parsed output,
    // key - the command number and url - the URL that the command should operate on
    std::string key = "", url = "";
    // the spaceCount keeps track of how many space-separated tokens we've seen so far
    int spaceCount = 0;
    // the current token we iterate over the input string
    std::string current = "";

    //this for loop iterates over the chars in the input
    for (char ch : input) {
        // if the char is space it means a token ended
        if (ch == ' ') {
            // if the token is not empty (skips multipul spaces)
            if (!current.empty()) {
                // if we had no space till now it means we are in the first token so it must be the key
                if (spaceCount == 0) key = current;
                // else if we had one space till now it means we are in the second token so it must be the url
                else if (spaceCount == 1) url = current;
                // if there are more then 2 tokens return false because it doesnt match the format
                else return false; 
                current = "";
                spaceCount++;
            }
        } else {
            current += ch;
        }
    }
    //this if is for the last token that is not followed by space
    if (!current.empty()) {
        if (spaceCount == 0) key = current;
        else if (spaceCount == 1) url = current;
        else return false;
    }

    if (key.empty() || url.empty()) return false;

    // check that the url is in URL format using regex
    std::regex urlRegex(R"(^((https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z0-9]{2,})(\/\S*)?$)");
    if (!std::regex_match(url, urlRegex)) return false;

    keyOut = key;
    urlOut = url;
    return true;
}