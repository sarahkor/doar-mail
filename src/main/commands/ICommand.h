#include <string>
class ICommand {
public:
    virtual void execute(const std::string& input) = 0;
    virtual ~ICommand() = default;
};
