#include <gtest/gtest.h>
#include <thread>
#include <chrono>
#include <netinet/in.h>
#include <unistd.h>
#include <sys/socket.h>
#include <arpa/inet.h>
#include "server/Server.h"
#include "server/ClientSession.h"
#include "Blacklist.h"
#include "BloomFilter.h"
#include "FileLineStorage.h"
#include "ConfigurableHash.h"
#include "AddURLCommand.h"
#include "CheckURLCommand.h"
#include "DeleteURLCommand.h"

// Simple test that server starts and accepts one client connection
TEST(ServerSanity, StartsAndAcceptsClient) {
    int testPort = 55555;

    // Create server in a background thread
    std::thread serverThread([&]() {
        std::map<std::string, ICommand*> commands;

        auto storage = std::make_unique<FileLineStorage>("testdata.txt");
        auto blacklist = new Blacklist(std::move(storage));
        std::vector<std::shared_ptr<IHashFunction>> hashes = {
            std::make_shared<ConfigurableHash>("std", 3)
        };
        auto bloom = new BloomFilter(64, hashes, nullptr);

        ICommand* post = new AddURLCommand(bloom, blacklist);
        ICommand* get = new CheckURLCommand(bloom, blacklist);
        ICommand* del = new DeleteURLCommand(bloom, blacklist);

        commands["POST"] = post;
        commands["GET"] = get;
        commands["DELETE"] = del;

        Server server(nullptr, commands, testPort);
        server.run();  // Will block on accept()

        delete post;
        delete get;
        delete del;
        delete bloom;
        delete blacklist;
    });

    // Give the server time to start
    std::this_thread::sleep_for(std::chrono::milliseconds(200));

    // Connect to the server
    int sock = socket(AF_INET, SOCK_STREAM, 0);
    ASSERT_NE(sock, -1);

    sockaddr_in addr{};
    addr.sin_family = AF_INET;
    addr.sin_port = htons(testPort);
    addr.sin_addr.s_addr = inet_addr("127.0.0.1");

    int result = connect(sock, (struct sockaddr*)&addr, sizeof(addr));
    EXPECT_EQ(result, 0);  // Success if result is 0

    close(sock);  // Close client socket
    std::this_thread::sleep_for(std::chrono::milliseconds(100));  // Let server finish
    pthread_cancel(serverThread.native_handle()); // forcibly stop for test purposes
    serverThread.join();
}
