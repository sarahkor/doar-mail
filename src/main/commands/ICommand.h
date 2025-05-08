#ifndef ICOMMAND_H
#define ICOMMAND_H

#include <string>

// ICommand is an interface for command objects that can be executed with a string input.
// This is the base for implementing the Command design pattern.
class ICommand {
public:
    // Pure virtual function to execute the command logic using the given input string.
    virtual std::string execute(const std::string& input) = 0;
    // Virtual destructor to ensure proper cleanup of derived classes via base pointers.
    virtual ~ICommand() = default;
};

#endif
