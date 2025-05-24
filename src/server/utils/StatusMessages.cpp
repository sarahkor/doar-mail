#include "StatusMessages.h"

std::string StatusMessages::get(int code) {
    static const std::unordered_map<int, std::string> status = {
        {200, "200 OK\n\n"},
        {201, "201 Created\n"},
        {204, "204 No Content\n"},
        {400, "400 Bad Request\n"},
        {404, "404 Not Found\n"}
    };
    auto it = status.find(code);
    return it != status.end() ? it->second : "Unknown Status\n";
}
