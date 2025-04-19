#include "ConfigurableHash.h"
#include <functional>

ConfigurableHash::ConfigurableHash(const std::string& type, int repeat)
    : type(type), repeat(repeat) {}

size_t ConfigurableHash::hash(const std::string& input) const {
    std::string current = input;
    size_t result = 0;

    for (int i = 0; i < repeat; ++i) {
        if (type == "std") {
            result = std::hash<std::string>{}(current);
            current = std::to_string(result);  // feed into next round
        }
        // Future: add more types like "mod", "reversed", etc.
    }

    return result;
}
