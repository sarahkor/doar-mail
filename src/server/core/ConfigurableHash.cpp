#include "ConfigurableHash.h"
#include <stdexcept>    
#include <functional>   
#include <string>       

ConfigurableHash::ConfigurableHash(const std::string& type, size_t repeat)
    : type(type), repeat(repeat) {
    if (repeat == 0) {
        throw std::invalid_argument("Repeat must be positive");
    }
}

size_t ConfigurableHash::hash(const std::string& input) const {
    if (type == "std") {
        std::hash<std::string> hasher;
        size_t result = hasher(input); // first hash on input

        for (size_t i = 1; i < repeat; ++i) {
            result = hasher(std::to_string(result)); // hash on to_string of previous result
        }

        return result;
    } else {
        throw std::invalid_argument("Unsupported hash type: " + type);
    }
}
