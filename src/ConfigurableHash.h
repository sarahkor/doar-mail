#pragma once
#include "IHashFunction.h"
#include <string>

class ConfigurableHash : public IHashFunction {
private:
    std::string type;  // e.g. "std"
    int repeat;        // how many times to apply the hash

public:
    ConfigurableHash(const std::string& type, int repeat = 1);
    size_t hash(const std::string& input) const override;
};
