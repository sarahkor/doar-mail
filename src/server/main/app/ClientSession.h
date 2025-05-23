#ifndef CLIENT_SESSION_H
#define CLIENT_SESSION_H

#include "server/main/commands/ICommand.h"
#include "server/main/commands/CommandParser.h"
#include "server/utils/StatusMessages.h"
#include <map>
#include <string>
#include <sys/socket.h>
#include <unistd.h>

class ClientSession
{
public:
    ClientSession(int clientSocket, std::map<std::string, ICommand *> &commands);
    void handle();

private:
    int clientSocket;
    std::map<std::string, ICommand *> &commands;
};

#endif
