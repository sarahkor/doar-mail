#ifndef CONSOLE_MENU_H
#define CONSOLE_MENU_H
#include "IMenu.h"
#include <iostream>
#include <string>

class ConsoleMenu : public IMenu {
private:
    std::istream& in;
    std::ostream& out;

public:
    ConsoleMenu(std::istream& inStream, std::ostream& outStream);

    std::string nextCommand() override;
    void displayError(const std::string& error) override;
};
#endif