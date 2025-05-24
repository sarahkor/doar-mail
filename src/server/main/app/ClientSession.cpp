#include "ClientSession.h"
#include <unistd.h> 
#include <string>

ClientSession::ClientSession(int clientSocket, std::map<std::string, ICommand*>& commands)
    : clientSocket(clientSocket), commands(commands) {}

void ClientSession::handle() {
    CommandParser parser(commands);
    char ch;
    std::string buffer;

    while (read(clientSocket, &ch, 1) > 0) {
        buffer += ch;
        if (ch == '\n') {
            buffer.erase(buffer.find_last_not_of(" \t\r\n") + 1);
            buffer.erase(0, buffer.find_first_not_of(" \t\r\n"));

            if (buffer.empty()) {
                std::string error = StatusMessages::get(400);
                send(clientSocket, error.c_str(), error.size(), 0);
                buffer.clear();
                continue;
            }

            std::string key, url;
            if (!parser.parse(buffer, key, url)) {
                std::string error = StatusMessages::get(400);
                send(clientSocket, error.c_str(), error.size(), 0);
                buffer.clear();
                continue;
            }

            try {
                ICommand* command = commands.at(key);
                std::string result = command->execute(url);
                send(clientSocket, result.c_str(), result.size(), 0);
            } catch (...) {
                std::string error = StatusMessages::get(400);
                send(clientSocket, error.c_str(), error.size(), 0);
            }

            buffer.clear();
        }
    }

    close(clientSocket);
}
