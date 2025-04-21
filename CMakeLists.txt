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
# Your project sources
add_library(CreateOurGmail_lib
    src/BloomFilter.cpp
    src/ConfigurableHash.cpp
    src/IBloomFilterStorage.cpp
    src/BinaryFileStorage.cpp
)


# Tests for Bloom Filter Core
enable_testing()
add_executable(tests
    src/tests/testMain.cpp
    src/tests/testBloomFilter.cpp
    src/tests/testHashClass.cpp
    src/tests/storage_test/bloom_filter_storage_test.cpp 
)

target_include_directories(tests PRIVATE ${CMAKE_CURRENT_SOURCE_DIR}/src)
target_link_libraries(tests PRIVATE CreateOurGmail_lib GTest::gtest_main)

include(GoogleTest)
gtest_discover_tests(tests)

