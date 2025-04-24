#pragma once

#include "IHashFunction.h"
#include <string>

// ConfigurableHash class using std::hash repeated N times
class ConfigurableHash : public IHashFunction {
private:
    std::string type;
    int repeat;

public:
    ConfigurableHash(const std::string& type, int repeat);

    // Hashes a string using the specified method and repeat count
    size_t hash(const std::string& input) const override;
};
