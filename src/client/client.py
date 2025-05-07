import socket
import sys

def main():
    # Checking that the number of arguments is correct
    if len(sys.argv) != 3:
        sys.exit(1)
    # Extracting the arguments
    server_ip = sys.argv[1]
    server_port = int(sys.argv[2])
    # The socket will close automatically
    try:
        # Opens the socket
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            # The client is trying to connect to the server.
            s.connect((server_ip, server_port))
            # A loop that waits for commands from the user
            while True:
                try:
                    # Does not print anything to the screen, the input will go to msg
                    msg = input()
                    # If no input from the user is entered, continue.
                    if msg == "":
                        continue
                    # Sending the message to the server
                    # The message is converted from a string to bytes using UTF-8 encoding
                    # and sent with an end-of-line character (\n) according to the protocol.
                    s.sendall((msg + '\n').encode('utf-8'))
                    response = ''
                    # Loop to read information until the server sends an \n
                    while not response.endswith('\n'):
                        # Requests bytes from the socket from the server (maximum length 4096 bytes)
                        data = s.recv(4096)
                         # If no input is entered, Disconnect from the server
                        if not data:
                            break
                        # Decode the bits received from the server into a string and add them to the previous response from the server.
                        response += data.decode('utf-8')
                    # Prints the response received from the server to the screen
                    # To prevent another line break, we add end=''
                    print(response, end='')
                # Allow the user to gracefully exit the client using Ctrl+C without displaying an error traceback
                except KeyboardInterrupt:
                    break
    # Handle the case where the server is unavailable or refusing the connection
    except ConnectionRefusedError:
        print("Could not connect to the server.")
# Ensure the client runs only when this script is executed directly, not when imported as a module
if __name__ == "__main__":
    main()
