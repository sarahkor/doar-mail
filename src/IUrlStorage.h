#pragma once

#include <vector>
#include <string>

// Interface for saving and loading records urls
class IUrlStorage {
public:
    virtual bool load(std::vector<std::string>& urls)   = 0;
    virtual bool save(const std::vector<std::string>& urls) = 0;
    virtual ~IUrlStorage() = default;
};
