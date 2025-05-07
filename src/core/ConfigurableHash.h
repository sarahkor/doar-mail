#include "IHashFunction.h"

class ConfigurableHash : public IHashFunction {
    private:
        std::string type;
        size_t repeat;   
    public:
        ConfigurableHash(const std::string& type, size_t repeat);   
        size_t hash(const std::string& input) const override;
    };
    