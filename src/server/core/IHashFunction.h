#ifndef IHASH_FUNCTION_H
#define IHASH_FUNCTION_H
#include <string>

// Abstract interface for hash functions
class IHashFunction {
public:
    virtual ~IHashFunction() = default;

    // Pure virtual method to hash a string and return a size_t value
    virtual size_t hash(const std::string& input) const = 0;
};
#endif