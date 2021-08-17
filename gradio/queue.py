import sqlite3
import os
import uuid
import json

DB_FILE = "gradio_queue.db"

def generate_hash():
    generate = True
    while generate:
        hash = uuid.uuid4().hex
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        c.execute("""
            SELECT hash FROM queue
            WHERE hash = ?;
        """, (hash,))
        conn.commit()
        generate = c.fetchone() is not None
    return hash

def init():
    if os.path.exists(DB_FILE):
        os.remove(DB_FILE)
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("BEGIN EXCLUSIVE")
    c.execute("""CREATE TABLE queue (
            queue_index integer PRIMARY KEY,
            hash text,
            input_data text,
            action text,
            popped integer DEFAULT 0
        );""")
    c.execute("""
        CREATE TABLE jobs (
            hash text PRIMARY KEY,
            status text,
            output_data text,
            error_message text
        );
    """)
    conn.commit()

def close():
    if os.path.exists(DB_FILE):
        os.remove(DB_FILE)

def pop():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("BEGIN EXCLUSIVE")
    c.execute("""
        SELECT queue_index, hash, input_data, action FROM queue
        WHERE popped = 0 ORDER BY queue_index ASC LIMIT 1;
    """)
    result = c.fetchone()
    if result is None:
        conn.commit()
        return None
    queue_index = result[0]
    c.execute("""
        UPDATE queue SET popped = 1, input_data = '' WHERE queue_index = ?;
    """, (queue_index,))
    conn.commit()
    return result[0], result[1], json.loads(result[2]), result[3]


def push(input_data, action):
    input_data = json.dumps(input_data)
    hash = generate_hash()
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("BEGIN EXCLUSIVE")
    c.execute("""
        INSERT INTO queue (hash, input_data, action)
        VALUES (?, ?, ?);
    """, (hash, input_data, action))
    conn.commit()
    return hash

def get_status(hash):
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("BEGIN EXCLUSIVE")
    c.execute("""
        SELECT queue_index, popped FROM queue WHERE hash = ?;
    """, (hash,))
    result = c.fetchone()
    if result[1] == 1: # in jobs
        c.execute("""
            SELECT status, output_data, error_message FROM jobs WHERE hash = ?;
        """, (hash,))
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
                c.execute("""
                    UPDATE jobs SET output_data = '' WHERE hash = ?;
                """, (hash,))
                conn.commit()
                output_data = json.loads(output_data)
                return "COMPLETE", output_data
    else:
        queue_index = result[0]
        c.execute("""
            SELECT COUNT(*) FROM queue WHERE queue_index < ? and popped = 0;
        """, (queue_index,))
        result = c.fetchone()
        conn.commit()
        return "QUEUED", result[0]

def start_job(hash):
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("BEGIN EXCLUSIVE")
    c.execute("""
        UPDATE queue SET popped = 1 WHERE hash = ?;
    """, (hash,))
    c.execute("""
        INSERT INTO jobs (hash, status) VALUES (?, 'PENDING');
    """, (hash,))
    conn.commit()

def fail_job(hash, error_message):
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("BEGIN EXCLUSIVE")
    c.execute("""
        UPDATE jobs SET status = 'FAILED', error_message = ? WHERE hash = ?;
    """, (error_message, hash,))
    conn.commit()

def pass_job(hash, output_data):
    output_data = json.dumps(output_data)
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("BEGIN EXCLUSIVE")
    c.execute("""
        UPDATE jobs SET status = 'COMPLETE', output_data = ? WHERE hash = ?;
    """, (output_data, hash,))
    conn.commit()

