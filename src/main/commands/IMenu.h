#include <string>

class IMenu {
public:
    virtual std::string nextCommand() = 0;
    virtual void displayError(const std::string& error) = 0;
    virtual ~IMenu() = default;
};