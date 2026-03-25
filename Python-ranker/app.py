from flask import Flask, jsonify
from flask_cors import CORS
import mysql.connector
from sentence_transformers import SentenceTransformer, util

app = Flask(__name__)
CORS(app) # Allows VS Code (React) to securely talk to PyCharm (Flask)

# --- 1. LOAD AI MODEL ONCE AT STARTUP ---
print("Starting up the AI-Scholar Recommendation Engine...")
model = SentenceTransformer('all-MiniLM-L6-v2')
print("Model Loaded! API is active and listening.")

# --- 2. DATABASE CONNECTION HELPER ---
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",               # Update if needed
        password="Bharana@2004",  # Put your MySQL password here!
        database="elibrary_db"    # Put your exact schema name here!
    )

# --- 3. THE API ENDPOINT ---
# When React asks for /api/recommend/1508, this function runs!
@app.route('/api/recommend/<int:book_id>', methods=['GET'])
def recommend_books(book_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # A. Get the book the user just read
        cursor.execute("SELECT title, description FROM books WHERE id = %s", (book_id,))
        seed_book = cursor.fetchone()

        if not seed_book:
            return jsonify({"error": f"Could not find book with ID {book_id}"}), 404

        # B. Get all other unread books (Including cover_url for React!)
        cursor.execute("SELECT id, title, description, cover_url FROM books WHERE id != %s", (book_id,))
        other_books = cursor.fetchall()

        # C. Run the AI Math
        seed_embedding = model.encode(seed_book['description'])
        other_descriptions = [book['description'] for book in other_books]
        other_embeddings = model.encode(other_descriptions)

        cosine_scores = util.cos_sim(seed_embedding, other_embeddings)[0]

        # D. Attach scores and sort
        for i in range(len(other_books)):
            other_books[i]['match_score'] = round(cosine_scores[i].item() * 100, 2)

        recommended = sorted(other_books, key=lambda x: x['match_score'], reverse=True)

        # E. Package it up nicely for VS Code
        return jsonify({
            "status": "success",
            "based_on_book": seed_book['title'],
            "recommendations": recommended[:3] # Send the top 3
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

# --- 4. START THE SERVER ---
if __name__ == '__main__':
    # Running on port 5000
    app.run(port=5000, debug=True)