// Counter used to assign temporary IDs to blacklist entries
let idCounter = 0;
// Node.js 'net' module is used to create TCP connections
const net = require('net');

// Sends a request to add a URL to the blacklist on the C++ server
const add = (url) => {
    return new Promise((resolve, reject) => {
        const client = new net.Socket(); // Create a new TCP client socket
        let response = '';

        // Connect to the C++ server on localhost and port 12345
        client.connect(12345, '127.0.0.1', () => {
            // Send the add-url command with the given URL
            client.write(`add-url ${url}\n`);
        });

        // Accumulate the server response data
        client.on('data', (data) => {
            response += data.toString();
        });

        // When the server closes the connection
        client.on('end', () => {
            // Construct a local response object to return to the client
            // In real implementation, consider parsing actual response if needed
            const entry = { id: ++idCounter, url };
            resolve(entry);
        });

        // Handle connection or transmission errors
        client.on('error', (err) => {
            reject(err);
        });
    });
};

// Sends a request to remove a URL from the blacklist by ID
const remove = (id) => {
    return new Promise((resolve, reject) => {
        const client = new net.Socket(); // Create a new TCP client socket
        let response = '';

        // Connect to the C++ server on localhost and port 12345
        client.connect(12345, '127.0.0.1', () => {
            // Send the delete-url command with the given ID
            client.write(`delete-url ${id}\n`);
        });

        // Accumulate the server response data
        client.on('data', (data) => {
            response += data.toString();
        });

        // When the server closes the connection
        client.on('end', () => {
            // Check if the response indicates a successful removal
            const success = response.trim().toLowerCase() === 'ok';
            resolve(success);
        });

        // Handle connection or transmission errors
        client.on('error', (err) => {
            reject(err);
        });
    });
};

// Export the functions so they can be used by controllers
module.exports = {
    add,
    remove
};
