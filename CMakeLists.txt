message(STATUS "Using CMakeLists.txt from: ${CMAKE_CURRENT_LIST_DIR}")
cmake_minimum_required(VERSION 3.14)
project(CreateOurGmail LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Fetch GoogleTest
include(FetchContent)
FetchContent_Declare(
    googletest
    URL https://github.com/google/googletest/archive/release-1.12.1.zip
)
set(gtest_force_shared_crt ON CACHE BOOL "" FORCE)
FetchContent_MakeAvailable(googletest)

# === Shared Library ===
add_library(CreateOurGmail_lib
    src/core/BloomFilter.cpp
    src/core/ConfigurableHash.cpp
    src/core/IBloomFilterStorage.cpp
    src/core/BinaryFileStorage.cpp
    src/core/Blacklist.cpp
    src/core/FileLineStorage.cpp
    src/core/IUrlStorage.cpp
    src/main/commands/AddURLCommand.cpp
    src/main/commands/CheckURLCommand.cpp
    src/main/commands/CommandParser.cpp
    src/main/commands/ConsoleMenu.cpp     
    src/main/commands/DeleteURLCommand.cpp
    src/main/app/App.cpp 
    src/utils/StatusMessages.cpp
    src/utils/SetupParser.cpp
    src/server/Server.cpp         
    src/server/ClientSession.cpp  
)
target_include_directories(CreateOurGmail_lib PUBLIC
    ${CMAKE_CURRENT_SOURCE_DIR}/src
)

# === Server ===
add_executable(server
    src/main.cpp
)
target_link_libraries(server PRIVATE CreateOurGmail_lib)

# === Tests ===
enable_testing()
add_executable(tests
    src/tests/commands_tests/DeleteUrlTests.cpp
    src/tests/flow_tests/SetupParserTests.cpp
    src/tests/flow_tests/StatusMessagesTests.cpp
    src/tests/server_tests/ServerSanityTests.cpp
)
target_include_directories(tests PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}/src
    ${CMAKE_CURRENT_SOURCE_DIR}/src/core
    ${CMAKE_CURRENT_SOURCE_DIR}/src/main/commands
    ${CMAKE_CURRENT_SOURCE_DIR}/src/utils
    ${CMAKE_CURRENT_SOURCE_DIR}/src/server
)
target_link_libraries(tests PRIVATE CreateOurGmail_lib GTest::gtest_main)
include(GoogleTest)
gtest_discover_tests(tests)
