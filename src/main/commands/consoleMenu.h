#pragma once

#include "IMenu.h"
#include <string>

class ConsoleMenu : public IMenu {
public:
    std::string nextCommand() override;
    void displayError(const std::string& error) override;
};
