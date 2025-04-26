#include "IHashFunction.h"

class ConfigurableHash : public IHashFunction {
    private:
        std::string type;
        size_t repeat;   // <<< change from int to size_t
    public:
        ConfigurableHash(const std::string& type, size_t repeat);   // <<< constructor
        size_t hash(const std::string& input) const override;
    };
    