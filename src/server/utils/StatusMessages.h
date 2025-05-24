#ifndef STATUS_MESSAGES_H
#define STATUS_MESSAGES_H
#include <string>
#include <unordered_map>

class StatusMessages {
public:
    static std::string get(int code);
};
#endif