import sqlite3
import os
from datetime import datetime, timedelta

# --- Configuration ---
DB_FILE = "thrive.db"
# Ensures the script looks for the db file in the same directory as the script
DB_PATH = os.path.join(os.path.dirname(__file__), DB_FILE)

# --- Main Function to Initialize Database ---
def initialize_database():
    """
    Initializes the database. Deletes the old one if it exists,
    creates new tables, and seeds them with sample data.
    """
    # Delete the old database file if it exists to ensure a fresh start
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
        print("Old database removed.")

    # Connect to the SQLite database (this will create the file)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    print("Database created and connected.")

    # --- Create Tables ---
    # 1. Create the 'clients' table
    cursor.execute('''
        CREATE TABLE clients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL
        );
    ''')
    print("Table 'clients' created.")

    # 2. Create the 'logs' table with a foreign key to the 'clients' table
    cursor.execute('''
        CREATE TABLE logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            mood_score INTEGER NOT NULL,
            activities TEXT,
            note TEXT,
            timestamp TEXT NOT NULL,
            client_id INTEGER NOT NULL,
            FOREIGN KEY (client_id) REFERENCES clients (id)
        );
    ''')
    print("Table 'logs' created.")

    # --- Seed Data ---
    # 1. Seed the 'clients' table
    clients_to_add = [
        ('John', 'Doe'),
        ('Jane', 'Smith'),
        ('Peter', 'Jones')
    ]
    cursor.executemany('INSERT INTO clients (first_name, last_name) VALUES (?, ?)', clients_to_add)
    print(f"{len(clients_to_add)} clients seeded.")

    # 2. Seed the 'logs' table with realistic, historical data
    logs_to_add = []
    today = datetime.now()

    # Logs for John Doe (Client ID 1) - showing a slight decline
    for i in range(15):
        date = today - timedelta(days=i)
        mood = 4 if i > 7 else 3 # Mood was 4, recently dropped to 3
        logs_to_add.append((mood, 'Group Therapy,Medication Taken', f'Day {15-i} note.', date.isoformat(), 1))

    # Logs for Jane Smith (Client ID 2) - showing improvement
    for i in range(15):
        date = today - timedelta(days=i)
        mood = 3 if i > 7 else 5 # Mood was 3, recently improved to 5
        logs_to_add.append((mood, 'Art Class,Went for a Walk', f'A positive day {15-i}.', date.isoformat(), 2))
        
    cursor.executemany(
        'INSERT INTO logs (mood_score, activities, note, timestamp, client_id) VALUES (?, ?, ?, ?, ?)',
        logs_to_add
    )
    print(f"{len(logs_to_add)} logs seeded.")


    # --- Commit changes and close the connection ---
    conn.commit()
    conn.close()
    print("Data committed and connection closed. Database is ready!")


# --- Run the initialization ---
if __name__ == '__main__':
    initialize_database()