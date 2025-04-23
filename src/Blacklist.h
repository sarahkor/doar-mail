#pragma once
#include <string>
#include <vector>
#include "IUrlStorage.h"

class Blacklist {
private:
    // List of URLs stored in memory 
    std::vector<std::string> list;  
    // Storage mechanism for persisting the URL list
    std::unique_ptr<IUrlStorage> m_storage;

public:
    // Constructor: accepts a storage implementation for loading & saving URLs
    // Parameters: std::unique_ptr<IUrlStorage> storage
    Blacklist(std::unique_ptr<IUrlStorage> storage);
    // Add a new URL to in-memory list and persist immediately
    // Parameters: const std::string& url
    void add(const std::string& url);
    // Check if a URL exists in the in-memory list
    // Parameters: const std::string& url
    bool check(const std::string& url) const;
};
