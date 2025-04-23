#include "Blacklist.h"

void Blacklist::add(const std::string& url) {
    list.push_back(url);
}

bool Blacklist::check(const std::string& url) const {
    for (const std::string& line : list) {
        if (line == url) {
            return true;
        }
    }
    return false;
}
