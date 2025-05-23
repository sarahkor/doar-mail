#ifndef IMENU_H
#define IMENU_H

#include <string>

// IMenu is an interface for menu-like components that handle user input/output.
// It abstracts user interaction to allow flexible frontends.
class IMenu {
public:
    virtual std::string nextCommand() = 0;
    virtual void displayError(const std::string& error) = 0;
    virtual ~IMenu() = default;
};

#endif