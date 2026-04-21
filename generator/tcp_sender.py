import socket
import time

HOST = "localhost"
PORT = 9000

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((HOST, PORT))

print("Connected to Go server")

try:
    while True:
        message = "Hello from Python at " + time.strftime("%H:%M:%S")
        s.sendall(message.encode("utf-8"))
        print("Sent:", message)
        time.sleep(1)

except KeyboardInterrupt:
    print("Stopping generator...")

finally:
    s.close()
