// FileLineStorage.h
#ifndef FILE_LINE_STORAGE_H
#define FILE_LINE_STORAGE_H
#include "IUrlStorage.h"
#include <string>
#include <set>

class FileLineStorage : public IUrlStorage {
private:
    std::string m_path;
public:
    // Constructor: sets file path for URL storage
    // Parameters: const std::string& path
    explicit FileLineStorage(const std::string& path);
    // Load URLs from text file, one URL per line
    // Parameters: std::vector<std::string>& urls
    bool load(std::set<std::string>& urls) override;
    // Save URLs to text file, one URL per line
    // Parameters: const std::vector<std::string>& urls
    bool save(const std::set<std::string>& urls) override;
};
#endif
