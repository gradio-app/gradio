import json
import os
import sqlite3
import time
import uuid
from typing import Dict, Tuple

import requests

from gradio.routes import QueuePushBody

DB_FILE = "gradio_queue.db"


def queue_thread(path_to_local_server: str) -> None:
    while True:
        try:
            next_job = pop()
            if next_job is not None:
                _, hash, input_data, task_type = next_job
                start_job(hash)
                response = requests.post(
                    path_to_local_server + "api/" + task_type + "/", json=input_data
                )
                if response.status_code == 200:
                    pass_job(hash, response.json())
                else:
                    fail_job(hash, response.text)
            else:
                time.sleep(1)
        except:
            time.sleep(1)
            pass


def generate_hash() -> str:
    generate = True
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    while generate:
        hash = uuid.uuid4().hex
        c.execute(
            """
            SELECT hash FROM queue
            WHERE hash = ?;
        """,
            (hash,),
        )
        generate = c.fetchone() is not None
    conn.commit()
    return hash


def init() -> None:
    if os.path.exists(DB_FILE):
        os.remove(DB_FILE)
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute(
        """CREATE TABLE queue (
            queue_index integer PRIMARY KEY,
            hash text,
            input_data text,
            action text,
            popped integer DEFAULT 0
        );"""
    )
    c.execute(
        """
        CREATE TABLE jobs (
            hash text PRIMARY KEY,
            status text,
            output_data text,
            error_message text
        );
    """
    )
    conn.commit()


def close() -> None:
    if os.path.exists(DB_FILE):
        os.remove(DB_FILE)


def pop() -> Tuple[int, str, Dict, str]:
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("BEGIN EXCLUSIVE")
    c.execute(
        """
        SELECT queue_index, hash, input_data, action FROM queue
        WHERE popped = 0 ORDER BY queue_index ASC LIMIT 1;
    """
    )
    result = c.fetchone()
    if result is None:
        conn.commit()
        return None
    queue_index = result[0]
    c.execute(
        """
        UPDATE queue SET popped = 1, input_data = '' WHERE queue_index = ?;
    """,
        (queue_index,),
    )
    conn.commit()
    return result[0], result[1], json.loads(result[2]), result[3]


def push(body: QueuePushBody) -> Tuple[str, int]:
    action = body.action
    input_data = json.dumps({"data": body.data})
    hash = generate_hash()
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute(
        """
        INSERT INTO queue (hash, input_data, action)
        VALUES (?, ?, ?);
    """,
        (hash, input_data, action),
    )
    queue_index = c.lastrowid
    c.execute(
        """
        SELECT COUNT(*) FROM queue WHERE queue_index < ? and popped = 0;
    """,
        (queue_index,),
    )
    queue_position = c.fetchone()[0]
    if queue_position is None:
        conn.commit()
        raise ValueError("Hash not found.")
    c.execute(
        """
        SELECT COUNT(*) FROM jobs WHERE status = "PENDING";
    """
    )
    result = c.fetchone()
    if not (result[0] == 0):
        queue_position += 1
    conn.commit()
    return hash, queue_position


def get_status(hash: str) -> Tuple[str, int]:
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute(
        """
        SELECT queue_index, popped FROM queue WHERE hash = ?;
    """,
        (hash,),
    )
    result = c.fetchone()
    if result is None:
        conn.commit()
        raise ValueError("Hash not found.")
    if result[1] == 1:  # in jobs
        c.execute(
            """
            SELECT status, output_data, error_message FROM jobs WHERE hash = ?;
        """,
            (hash,),
        )
        result = c.fetchone()
        if result is None:
            conn.commit()
            return "NOT FOUND", None
        else:
            status, output_data, error_message = result
            if status == "PENDING":
                conn.commit()
                return "PENDING", None
            elif status == "FAILED":
                conn.commit()
                return "FAILED", error_message
            elif status == "COMPLETE":
                c.execute(
                    """
                    UPDATE jobs SET output_data = '' WHERE hash = ?;
                """,
                    (hash,),
                )
                conn.commit()
                output_data = json.loads(output_data)
                return "COMPLETE", output_data
    else:  # in queue
        queue_index = result[0]
        c.execute(
            """
            SELECT COUNT(*) FROM queue WHERE queue_index < ? and popped = 0;
        """,
            (queue_index,),
        )
        result = c.fetchone()
        queue_position = result[0]
        c.execute(
            """
            SELECT COUNT(*) FROM jobs WHERE status = "PENDING";
        """
        )
        result = c.fetchone()
        if not (result[0] == 0):
            queue_position += 1
        conn.commit()
        return "QUEUED", queue_position


def start_job(hash: str) -> None:
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("BEGIN EXCLUSIVE")
    c.execute(
        """
        UPDATE queue SET popped = 1 WHERE hash = ?;
    """,
        (hash,),
    )
    c.execute(
        """
        INSERT INTO jobs (hash, status) VALUES (?, 'PENDING');
    """,
        (hash,),
    )
    conn.commit()


def fail_job(hash: str, error_message: str) -> None:
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute(
        """
        UPDATE jobs SET status = 'FAILED', error_message = ? WHERE hash = ?;
    """,
        (
            error_message,
            hash,
        ),
    )
    conn.commit()


def pass_job(hash: str, output_data: Dict) -> None:
    output_data = json.dumps(output_data)
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute(
        """
        UPDATE jobs SET status = 'COMPLETE', output_data = ? WHERE hash = ?;
    """,
        (
            output_data,
            hash,
        ),
    )
    conn.commit()
