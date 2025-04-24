// FileLineStorage.cpp
#include "FileLineStorage.h"
#include <fstream>

// Constructor implementation
FileLineStorage::FileLineStorage(const std::string& path)
  : m_path(path) {}

 // Load URLs from the file at m_path
bool FileLineStorage::load(std::vector<std::string>& urls) {
    std::ifstream ifs(m_path);
    if (!ifs.is_open()) return false;
    urls.clear();
    std::string line;
    while (std::getline(ifs, line)) {
        if (!line.empty()) {
            // add each non-empty line
            urls.push_back(line);
        }
    }
    return true;
}

// Save URLs into the file at m_path
bool FileLineStorage::save(const std::vector<std::string>& urls) {
    std::ofstream ofs(m_path, std::ios::trunc);
    if (!ofs.is_open()) {
        // cannot open file for writing
        return false;
    }
    for (const auto& u : urls) {
        // write each URL on its own line
        ofs << u << "\n";
    }
    return true;
}
