#pragma once
#include <string>
#include <unordered_map>

class StatusMessages {
public:
    static std::string get(int code);
};