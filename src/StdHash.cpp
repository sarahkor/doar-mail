#include "StdHash.h"
#include <functional>

size_t StdHash::hash(const std::string& input) const {
    return std::hash<std::string>{}(input);
}
