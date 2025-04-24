#include "ConfigurableHash.h"
#include <stdexcept>    
#include <functional>   
#include <string>       

ConfigurableHash::ConfigurableHash(const std::string& type, int repeat)
    : type(type), repeat(repeat) {
    if (repeat <= 0) {
        throw std::invalid_argument("Repeat must be positive");
    }
}

size_t ConfigurableHash::hash(const std::string& input) const {
    if (type == "std") {
        std::hash<std::string> hasher;
        size_t result = hasher(input);

        for (int i = 1; i < repeat; ++i) {
            result = hasher(input + std::to_string(result));
        }

        return result;
    } else {
        throw std::invalid_argument("Unsupported hash type: " + type);
    }
}
