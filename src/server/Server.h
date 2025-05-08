#ifndef SERVER_H  
#define SERVER_H

#include <map>
#include <string>
#include "main/commands/ICommand.h"
#include "main/commands/IMenu.h"

class Server {
private:
    IMenu* menu;
    std::map<std::string, ICommand*>& commands;
    int port;

public:
    // Constructor
    Server(IMenu* menu, std::map<std::string, ICommand*>& commands, int port);

    // Starts the server
    void run();
};

#endif // SERVER_H
