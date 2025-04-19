#include "BinaryFileStorage.h"
#include <fstream>
#include <cstring>
using namespace std;


// Constructor: receives a string that is the path to the file
// And saves it in the path variable of the class
BinaryFileStorage::BinaryFileStorage(const std::string& path)
    : m_path(path) {}


// A function receives a vector that is passed as a reference
// The function inserts the contents of the binary file into the vector
// Returns true or false depending on whether it was able to read from the file
// The function is invoked from the object BinaryFileStorage
// In which the path of the Bloom filter file is stored.
bool BinaryFileStorage::load(vector<unsigned char>& bits) {

    // Opens the file for binary reading (not textual) according to the path saved in the class.
    ifstream in(m_path, ios::binary);


    // Checks if the file was opened successfully. If not, returns false.
    if (!in.is_open()) {
        return false;
    }

    // Moves the cursor to the end of the file, checks its size, then returns it to the beginning.
    // This way we know exactly how many bytes to allocate in the bits array
    in.seekg(0, ios::end);
    std::streamsize size = in.tellg();
    in.seekg(0, ios::beg);

    // Checks if the file is empty or broken – if so returns false
    if (size <= 0) {
        return false;
    }

    // Changes the size of the vector that will contain all the bytes from the file.
    bits.resize(size);

    // Reads the entire contents of the file into the bits array. If the read fails – returns false.
    if (!in.read(reinterpret_cast<char*>(bits.data()), size)) {
        return false;
    }

    return true;
}

// (optional for now – not implemented)
bool BinaryFileStorage::save(const vector<unsigned char>& bits) {
    // Not implemented in this task
    return false;
}
