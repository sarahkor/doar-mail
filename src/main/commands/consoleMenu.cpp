#include "ConsoleMenu.h"

// Constructor that initializes the ConsoleMenu with custom input and output streams.
// This allows the menu to read from and write to any streams (e.g., std::cin/std::cout or file streams),
ConsoleMenu::ConsoleMenu(std::istream& inStream, std::ostream& outStream)
    : in(inStream), out(outStream) {}

// Reads the next command from the input stream.
// Waits for a full line of input and returns it as a string.
std::string ConsoleMenu::nextCommand() {
    std::string input;
    std::getline(in, input);
    return input;
}
// Displays an error message to the output stream, followed by a newline.
// Only prints if the error string is not empty.
void ConsoleMenu::displayError(const std::string& error) {
    if (!error.empty()) {
        out << error << std::endl;
    }
}