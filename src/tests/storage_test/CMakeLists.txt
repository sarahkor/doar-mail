# Build the storage_tests binary and link it against the core library
add_executable(storage_tests
  bloom_filter_storage_test.cpp
)

# Make sure storage_tests can find all of your headers (pointing at src/)
target_include_directories(storage_tests PRIVATE
  ${CMAKE_CURRENT_SOURCE_DIR}/../../src
)

# Link against your core library (which compiles BloomFilter, ConfigurableHash, BinaryFileStorage)
# and GoogleTest
target_link_libraries(storage_tests
  PRIVATE
    CreateOurGmail_lib
    GTest::gtest_main
)

include(GoogleTest)
gtest_discover_tests(storage_tests)