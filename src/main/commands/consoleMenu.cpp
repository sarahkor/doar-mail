#include "ConsoleMenu.h"
#include <iostream>

std::string ConsoleMenu::nextCommand() {
    std::string input;
    std::getline(std::cin, input);
    return input;
}

void ConsoleMenu::displayError(const std::string& error) {
    if (!error.empty()) {
        std::cerr << error << std::endl;
    }
}
