#include "SetupParser.h"

bool SetupParser::Parse(int argc, char* argv[], int& port, int& bloomSize, std::vector<int>& hashRepeats) {
    if (argc < 4) {
        return false; // not enough args: need program name, port, bloom size, and at least one hash
    }

    std::vector<int> values;
    for (int i = 1; i < argc; i++) {
        std::string token = argv[i];
        for (char ch : token) {
            if (ch < '0' || ch > '9') {
                return false; // invalid character
            }
        }
        values.push_back(std::stoi(token));
    }

    port = values[0];
    bloomSize = values[1];
    if (port <= 1023 || port > 65535 || bloomSize <= 0) {
        return false;
    }

    hashRepeats.assign(values.begin() + 2, values.end());
    for (int repeat : hashRepeats) {
        if (repeat <= 0) return false;
    }

    return !hashRepeats.empty();
}