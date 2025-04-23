// FileLineStorage.h
#pragma once
#include "IUrlStorage.h"
#include <string>
#include <vector>

class FileLineStorage : public IUrlStorage {
private:
    std::string m_path;
public:
    // Constructor: sets file path for URL storage
    // Parameters: const std::string& path
    explicit FileLineStorage(const std::string& path);
    // Load URLs from text file, one URL per line
    // Parameters: std::vector<std::string>& urls
    bool load(std::vector<std::string>& urls) override;
    // Save URLs to text file, one URL per line
    // Parameters: const std::vector<std::string>& urls
    bool save(const std::vector<std::string>& urls) override;
};
