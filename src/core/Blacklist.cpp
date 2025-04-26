#include "Blacklist.h"
#include <fstream>
#include <algorithm>

// Constructor: loads existing URLs from storage into memory
// Parameters: std::unique_ptr<IUrlStorage> storage
Blacklist::Blacklist(std::unique_ptr<IUrlStorage> storage)
  : m_storage(std::move(storage)) {
    // load existing URL list from disk into 'list'
    if (m_storage) {
        m_storage->load(list);
    }
}

// Add a URL to the blacklist and save the updated list
// Parameters: const std::string& url
void Blacklist::add(const std::string& url) {
    if (std::find(list.begin(), list.end(), url) == list.end()) {
        // append to in-memory list
        list.push_back(url);
        // persist updated list right away
        if (m_storage) m_storage->save(list);
    }
}


// Check if a URL is present in the blacklist
// Parameters: const std::string& url
bool Blacklist::check(const std::string& url) const {
    // scan in-memory list for a match
    for (const std::string& u : list) {
        if (u == url) return true;
    }
    return false;
}
// destructor
Blacklist::~Blacklist() {
    if (m_storage) {
        m_storage->save(list);
    }
}