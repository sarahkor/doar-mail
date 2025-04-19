#include "ConfigurableHash.h"
#include <functional>

ConfigurableHash::ConfigurableHash(const std::string& type, int repeat)
    : type(type), repeat(repeat) {}

    size_t ConfigurableHash::hash(const std::string& input) const {
        std::hash<std::string> hasher;
        std::string current = input;
        size_t result = hasher(current);
    
        for (int i = 1; i < repeat; ++i) {
            current += std::to_string(result);  // mix in previous result
            result = hasher(current);
        }
    
        return result;
    }
    
