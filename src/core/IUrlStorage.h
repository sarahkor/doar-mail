#pragma once

#include <set>
#include <string>

// Interface for saving and loading records urls
class IUrlStorage {
public:
    virtual bool load(std::set<std::string>& urls)   = 0;
    virtual bool save(const std::set<std::string>& urls) = 0;
    virtual ~IUrlStorage() = default;
};
