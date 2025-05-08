#ifndef SETUP_PARSER_H
#define SETUP_PARSER_H

#include <vector>
#include <string>

class SetupParser {
public:
    static bool Parse(int argc, char* argv[], int& port, int& bloomSize, std::vector<int>& hashRepeats);
};

#endif // SETUP_PARSER_H