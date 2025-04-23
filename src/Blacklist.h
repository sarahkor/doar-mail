#pragma once
#include <string>
#include <vector>

class Blacklist {
private:
    std::vector<std::string> list;

public:
    void add(const std::string& url);
    bool check(const std::string& url) const;
};
