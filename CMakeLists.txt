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
    src/server/core/BloomFilter.cpp
    src/server/core/ConfigurableHash.cpp
    src/server/core/IBloomFilterStorage.cpp
    src/server/core/BinaryFileStorage.cpp
    src/server/core/Blacklist.cpp
    src/server/core/FileLineStorage.cpp
    src/server/core/IUrlStorage.cpp
    src/server/main/commands/AddURLCommand.cpp
    src/server/main/commands/CheckURLCommand.cpp
    src/server/main/commands/CommandParser.cpp
    src/server/main/commands/ConsoleMenu.cpp
    src/server/main/commands/DeleteURLCommand.cpp
    src/server/main/app/App.cpp
    src/server/utils/StatusMessages.cpp
    src/server/utils/SetupParser.cpp
    src/server/main/app/Server.cpp
    src/server/main/app/ClientSession.cpp
)
target_include_directories(CreateOurGmail_lib PUBLIC
    ${CMAKE_CURRENT_SOURCE_DIR}/src
)

# === Server ===
add_executable(server
    src/server/main.cpp
)
target_link_libraries(server PRIVATE CreateOurGmail_lib)

# === Tests ===
enable_testing()
add_executable(tests
    src/server/tests/commands_tests/DeleteUrlTests.cpp
    src/server/tests/flow_tests/SetupParserTests.cpp
    src/server/tests/flow_tests/StatusMessagesTests.cpp
    src/server/tests/server_tests/ServerSanityTests.cpp
)
target_include_directories(tests PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}/src
    ${CMAKE_CURRENT_SOURCE_DIR}/src/server/core
    ${CMAKE_CURRENT_SOURCE_DIR}/src/server/main/commands
     ${CMAKE_CURRENT_SOURCE_DIR}/src/server/main/app
    ${CMAKE_CURRENT_SOURCE_DIR}/src/server/utils
    ${CMAKE_CURRENT_SOURCE_DIR}/src/server
)
target_link_libraries(tests PRIVATE CreateOurGmail_lib GTest::gtest_main)
include(GoogleTest)
gtest_discover_tests(tests)