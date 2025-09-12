# geo_sound/models.py
import sqlite3
from flask_bcrypt import generate_password_hash, check_password_hash
from geo_sound.config import Config

def init_db(config : Config):
    conn = sqlite3.connect(config.DB_FILE)
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()

def register_user(config : Config, username, password):
    if not username or not password:
        return False, "Username and password are required"

    conn = sqlite3.connect(config.DB_FILE)
    c = conn.cursor()
    try:
        c.execute("INSERT INTO users (username, password_hash) VALUES (?, ?)", 
                  (username, generate_password_hash(password).decode("utf-8")))
        conn.commit()
        return True, None
    except sqlite3.IntegrityError:
        return False, "Username already exists"
    finally:
        conn.close()

def verify_user(config : Config, username, password):
    if not username or not password:
        return False

    conn = sqlite3.connect(config.DB_FILE)
    c = conn.cursor()
    c.execute("SELECT password_hash FROM users WHERE username = ?", (username,))
    row = c.fetchone()
    conn.close()
    if row and check_password_hash(row[0], password):
        return True
    return False
