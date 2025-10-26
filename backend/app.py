import sqlite3
import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime

# --- Configuration ---
DB_FILE = "thrive.db"
# Ensures the script looks for the db file in the same directory as the script
DB_PATH = os.path.join(os.path.dirname(__file__), DB_FILE)

# --- Flask App Initialization ---
app = Flask(__name__)
# Enable Cross-Origin Resource Sharing (CORS) to allow our React frontend
# to communicate with this backend server.
CORS(app)


# --- Helper Function to Connect to Database ---
def get_db_connection():
    """Establishes a connection to the database."""
    conn = sqlite3.connect(DB_PATH)
    # This line allows us to access columns by name (like a dictionary)
    conn.row_factory = sqlite3.Row
    return conn

# --- API Endpoints ---

# Endpoint 1: Get all clients
@app.route('/api/clients', methods=['GET'])
def get_clients():
    """Fetches a list of all clients from the database."""
    conn = get_db_connection()
    clients = conn.execute('SELECT id, first_name, last_name FROM clients').fetchall()
    conn.close()
    # Convert list of Row objects to a list of dictionaries
    client_list = [{"id": row['id'], "name": f"{row['first_name']} {row['last_name']}"} for row in clients]
    return jsonify(client_list)


# Endpoint 2: Get logs for a specific client
@app.route('/api/logs', methods=['GET'])
def get_logs():
    """Fetches all logs for a specific client, identified by a query parameter."""
    client_id = request.args.get('client_id')
    if not client_id:
        return jsonify({"error": "client_id parameter is required"}), 400

    conn = get_db_connection()
    logs = conn.execute(
        'SELECT id, mood_score, activities, note, timestamp FROM logs WHERE client_id = ? ORDER BY timestamp DESC',
        (client_id,)
    ).fetchall()
    conn.close()
    
    log_list = [dict(row) for row in logs]
    return jsonify(log_list)


# Endpoint 3: Create a new log
@app.route('/api/logs', methods=['POST'])
def add_log():
    """Adds a new log entry to the database."""
    new_log = request.get_json()
    
    # Basic validation
    if not all(k in new_log for k in ['client_id', 'mood_score', 'note']):
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        'INSERT INTO logs (client_id, mood_score, activities, note, timestamp) VALUES (?, ?, ?, ?, ?)',
        (
            new_log['client_id'],
            new_log['mood_score'],
            new_log.get('activities', ''), # Use .get for optional fields
            new_log['note'],
            datetime.now().isoformat() # Generate timestamp on the server
        )
    )
    conn.commit()
    conn.close()
    
    return jsonify({"message": "Log added successfully"}), 201


# Endpoint 4: The "AI Teaser" Summary Generator
@app.route('/api/generate-summary', methods=['GET'])
def generate_summary():
    """Generates a fake AI summary for a specific client's recent activity."""
    client_id = request.args.get('client_id')
    if not client_id:
        return jsonify({"error": "client_id parameter is required"}), 400
        
    conn = get_db_connection()
    
    # Get client's name
    client = conn.execute('SELECT first_name FROM clients WHERE id = ?', (client_id,)).fetchone()
    if not client:
        return jsonify({"error": "Client not found"}), 404
        
    # Get the last 7 days of logs
    logs = conn.execute(
        'SELECT mood_score, activities FROM logs WHERE client_id = ? ORDER BY timestamp DESC LIMIT 7',
        (client_id,)
    ).fetchall()
    conn.close()

    if not logs:
        summary = f"{client['first_name']} has no recent activity logged."
        return jsonify({"summary": summary})

    # Basic logic for the summary
    avg_mood = sum(log['mood_score'] for log in logs) / len(logs)
    all_activities = set()
    for log in logs:
        if log['activities']:
            all_activities.update(log['activities'].split(','))
    
    mood_trend = "stable"
    if len(logs) > 1:
        # Very simple trend: compare first and last mood in the period
        if logs[0]['mood_score'] > logs[-1]['mood_score']:
            mood_trend = "improving"
        elif logs[0]['mood_score'] < logs[-1]['mood_score']:
            mood_trend = "declining"

    summary = (
        f"{client['first_name']} has had a generally {mood_trend} week, with an average mood score of {avg_mood:.1f}. "
        f"Key activities included: {', '.join(list(all_activities)[:3])}. "
        "Continued monitoring is recommended."
    )
    
    return jsonify({"summary": summary})


# --- Main execution ---
if __name__ == '__main__':
    # The host='0.0.0.0' makes the server accessible from your network
    # The debug=True automatically reloads the server when you save changes
    app.run(host='0.0.0.0', port=5001, debug=True)