#include "Server.h"
#include "StatusMessages.h"
#include "main/commands/CommandParser.h"
#include "main/commands/ICommand.h"
#include <arpa/inet.h>
#include <netinet/in.h>
#include <sys/socket.h>
#include <unistd.h>

#include <string>
#include <memory>

Server::Server(IMenu* menu,
               std::map<std::string, ICommand*>& commands,
               int port)
    : menu(menu), commands(commands), port(port) {}

void Server::run() {
    int serverSocket = socket(AF_INET, SOCK_STREAM, 0);
    if (serverSocket < 0) {
        exit(EXIT_FAILURE);
    }

    int opt = 1;
    setsockopt(serverSocket, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));

    sockaddr_in serverAddr{};
    serverAddr.sin_family = AF_INET;
    serverAddr.sin_addr.s_addr = INADDR_ANY;
    serverAddr.sin_port = htons(port);

    if (bind(serverSocket, (struct sockaddr*)&serverAddr, sizeof(serverAddr)) < 0) {
        close(serverSocket);
        exit(EXIT_FAILURE);
    }

    if (listen(serverSocket, 1) < 0) {
        close(serverSocket);
        exit(EXIT_FAILURE);
    }

    while (true) {
        sockaddr_in clientAddr{};
        socklen_t clientLen = sizeof(clientAddr);
        int clientSocket = accept(serverSocket, (struct sockaddr*)&clientAddr, &clientLen);
        if (clientSocket < 0) {
            continue;
        }

        CommandParser parser(commands);
        char ch;
        std::string buffer;

        while (read(clientSocket, &ch, 1) > 0) {
            buffer += ch;
            if (ch == '\n') {
                buffer.erase(buffer.find_last_not_of("\r\n") + 1);

                try {
                    ICommand* cmd = parser.parse(buffer);
                    std::string response = cmd->execute(parser.getLastParsedUrl());
                    send(clientSocket, response.c_str(), response.size(), 0);
                } catch (const std::invalid_argument& e) {
                    int code = std::stoi(e.what()); // "400" or "404"
                    std::string error = StatusMessages::get(code);
                    send(clientSocket, error.c_str(), error.size(), 0);
                }

                buffer.clear();
            }
        }

        close(clientSocket);
    }

    close(serverSocket);
}
