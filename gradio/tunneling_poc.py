import json
import select
import socket
import struct
import sys
import threading
from time import sleep

FRPS_SERVER = ("gradio.proxy.huggingface.tech", 7000)


def handle_req_work_conn(run_id, port):
    # Connect to frps for the forward socket
    socket_worker = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    socket_worker.connect(FRPS_SERVER)

    # Send the run id (TypeNewWorkConn)
    send(socket_worker, {"run_id": run_id}, 119)

    # Wait for the server to ask to connect
    # We don't use the message as we don't need his content
    # Usefull if the client implement multiple proxy
    # In our use case only one that we know
    read(socket_worker)

    # Connect to the gradio app
    socket_gradio = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    socket_gradio.connect(("127.0.0.1", port))

    while True:
        r, w, x = select.select([socket_gradio, socket_worker], [], [])
        if socket_gradio in r:
            data = socket_gradio.recv(1024)
            if len(data) == 0:
                break
            socket_worker.send(data)
        if socket_worker in r:
            data = socket_worker.recv(1024)
            if len(data) == 0:
                break
            socket_gradio.send(data)
    socket_gradio.close()
    socket_worker.close()


# Send a message to frps
# First byte is the message type 
# https://github.com/fatedier/frp/blob/6ecc97c8571df002dd7cf42522e3f2ce9de9a14d/pkg/msg/msg.go#L20-L20
# 8 next bytes are the message length
# Then it's the json body
def send(client, msg, type):
    binary_message = bytearray(0)
    binary_message.extend([type])
    json_raw = json.dumps(msg).encode('utf-8')
    binary_message.extend(struct.pack('>q', len(json_raw)))
    binary_message.extend(json_raw)
    client.send(binary_message)


# Read message from frps
# First byte is the message type 
# https://github.com/fatedier/frp/blob/6ecc97c8571df002dd7cf42522e3f2ce9de9a14d/pkg/msg/msg.go#L20-L20
# 8 next bytes are the message length
# Then it's the json body
def read(client):
    data = client.recv(1)
    if not data:
        return None, None
    binary_type = list(data)[0]

    size = client.recv(8)
    if not size:
        return None, None
    size = struct.unpack('>Q', size)[0]
    json_raw = client.recv(size)
    return json.loads(json_raw), binary_type


# Start heartbeat
def heartbeat(client):
    try:
        while True:
            send(client, {}, 104)
            sleep(15)
    except Exception:
        pass


def client_loop(client, run_id, port):
    while True:
        msg, type = read(client)
        if not type:
            break
        # TypeReqWorkConn
        if type == 114:
            threading.Thread(target=handle_req_work_conn, args=(run_id, port)).start()
            continue
        # Pong
        if type == 52:
            # Simple pong from server nothing to do
            continue
    client.close()


def create_tunnel(port):
    # Connect to frps
    frps_client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    frps_client.connect(FRPS_SERVER)

    # Send `TypeLogin` 
    # TODO
    # Privilege Key and Timestamp should be generate like:
    # https://github.com/fatedier/frp/blob/6ecc97c8571df002dd7cf42522e3f2ce9de9a14d/pkg/util/util/util.go#L46-L46
    send(frps_client, {"version": "0.44.0", "pool_count": 1, "privilege_key": "20ca2a69b42165ffa674ce38284b04cf",
                       "timestamp": 1664909098, }, 111)

    # Wait for response `TypeLoginResp`
    login_response, _ = read(frps_client)

    if not login_response:
        # TODO Handle this correctly
        print("error getting response")
        sys.exit(1)

    if 'error' in login_response:
        # TODO Handle this correctly
        print("error during login")
        sys.exit(1)

    run_id = login_response["run_id"]

    # Server will ask to warm connection
    msg, msg_type = read(frps_client)

    if msg_type != 114:
        # TODO Handle this correctly
        sys.exit(1)

    # Start a warm-up connection
    threading.Thread(target=handle_req_work_conn, args=(run_id, port)).start()

    # Sending proxy information `TypeNewProxy`
    send(frps_client, {"proxy_type": "http"}, 112)
    msg, msg_type = read(frps_client)

    if msg_type != 50:
        # TODO Handle this correctly
        print("error during proxy registration")
        sys.exit(1)

    # Starting heartbeat and frps_client loop
    threading.Thread(target=heartbeat, args=(frps_client,)).start()
    threading.Thread(target=client_loop, args=(frps_client, run_id, port)).start()

    return msg["remote_addr"]