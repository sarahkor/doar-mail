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
    // insert returns a pair: iterator and bool (true if inserted)
    std::pair<std::set<std::string>::iterator, bool> result = list.insert(url);
    if (result.second && m_storage) {
        // persist updated list right away
        m_storage->save(list);
    }
}


// Check if a URL is present in the blacklist
// Parameters: const std::string& url
bool Blacklist::check(const std::string& url) const {
    return list.count(url) > 0;
}

// remove a url from the blacklist
bool Blacklist::remove(const std::string& url) {
    // iterate over all urls in the list to dind the url
    std::set<std::string>::iterator iter = list.find(url);
    // if the url was not found we will reach the end of the list 
    // (one past the last element) o.w we found it and it can be earased
    if (iter != list.end()) {
        list.erase(iter);
        if (m_storage) {
            // persist updated list right away
            m_storage->save(list);
        }
        return true;
    }
    return false;
}
// destructor
Blacklist::~Blacklist() {
    if (m_storage) {
        m_storage->save(list);
    }
}