#ifndef BLACKLIST_H
#define BLACKLIST_H
#include <string>
#include <set>
#include <memory>
#include "IUrlStorage.h"

class Blacklist {
private:
    // List of URLs stored in memory 
    std::set<std::string> list;
    // Storage mechanism for persisting the URL list
    std::unique_ptr<IUrlStorage> m_storage;

public:
    // Constructor: accepts a storage implementation for loading & saving URLs
    // Parameters: std::unique_ptr<IUrlStorage> storage
    Blacklist(std::unique_ptr<IUrlStorage> storage);
    // destructor
    ~Blacklist();
    // Add a new URL to in-memory list and persist immediately
    // Parameters: const std::string& url
    void add(const std::string& url);
    // Check if a URL exists in the in-memory list
    // Parameters: const std::string& url
    bool check(const std::string& url) const;
    // Removes a URL from the blacklist and saves the change
    bool remove(const std::string& url);
};
#endif
