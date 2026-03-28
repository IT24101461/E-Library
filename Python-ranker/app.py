<<<<<<< HEAD
import pandas as pd
from flask import Flask, jsonify
from flask_cors import CORS
from sentence_transformers import SentenceTransformer
import faiss
import os
import math

app = Flask(__name__)
CORS(app)

print("Starting up the AI-Scholar Recommendation Engine (FAISS Fast Mode)...")
model = SentenceTransformer('all-MiniLM-L6-v2')

print("Loading FAISS index and metadata...")
try:
    index = faiss.read_index("books.index")
    df_meta = pd.read_pickle("books_metadata.pkl")
    print("FAISS index loaded successfully.")
except Exception as e:
    print("Error loading FAISS index:", e)

print("Loading user book.csv to get the newest info...")
df_csv = pd.read_csv("book.csv")

# Ensure 'id' exists
if 'book_id' in df_csv.columns and 'id' not in df_csv.columns:
    df_csv['id'] = df_csv['book_id']
if 'id' not in df_csv.columns and 'bookId' in df_csv.columns:
    df_csv['id'] = df_csv['bookId']

# Normalize cover column
if 'cover_url' not in df_csv.columns:
    for col in ['image_url', 'images.url', 'image', 'images_url']:
        if col in df_csv.columns:
            df_csv['cover_url'] = df_csv[col]
            break

if 'description' not in df_csv.columns:
    df_csv['description'] = ''
else:
    df_csv['description'] = df_csv['description'].fillna("")

print("Model and Database Loaded! API is active and listening.")

@app.route('/api/recommend/<int:book_id>', methods=['GET'])
def recommend_books(book_id):
    try:
        # A. Get the seed book from user's CSV
        seed_book = df_csv[df_csv['id'] == book_id]
        if seed_book.empty:
            return jsonify({"error": f"Could not find book with ID {book_id} in CSV"}), 404
        
        seed_book_data = seed_book.iloc[0]
        seed_title = seed_book_data['title']
        seed_description = str(seed_book_data.get('description', ''))
        
        # B. Encode seed request
        import numpy as np
        query_vector = model.encode([seed_description]).astype('float32')
        
        # C. Fast Similarity Search!
        D, I = index.search(query_vector, 5) # search top 5 to ensure we get 3 valid Others
        candidate_indices = I[0]
        
        # Extract the original book_id of the matches from metadata
        recommended_ids = df_meta.iloc[candidate_indices]['book_id'].tolist()
        
        # D. Map back to user's updated CSV
        results = []
        for match_id, score in zip(recommended_ids, D[0]):
            if int(match_id) == book_id:
                continue # Skip the seed book itself
            
            # Find row in user's CSV
            row_matches = df_csv[df_csv['id'] == match_id]
            if not row_matches.empty:
                row = row_matches.iloc[0]
                
                # Check for null image
                cover = row.get('cover_url')
                if pd.isna(cover):
                    cover = "https://via.placeholder.com/150x220?text=No+Cover"
                
                # Estimate a match score from 0-100% 
                match_percentage = max(70.0, 100.0 - float(score)*15.0)
                
                results.append({
                    "id": int(row['id']),
                    "title": str(row['title']),
                    "description": str(row.get('description', '')),
                    "cover_url": cover,
                    "match_score": round(match_percentage, 1)
                })
            
            if len(results) >= 3:
                break
                
        return jsonify({
            "status": "success",
            "based_on_book": str(seed_title),
            "recommendations": results
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

from flask import request

@app.route('/api/recommend/text', methods=['POST'])
def recommend_books_text():
    try:
        data = request.json
        seed_title = data.get('title', '')
        seed_description = data.get('description', '')
        seed_id = data.get('id', 0)
        
        query_text = seed_title + " " + seed_description
        if not query_text.strip():
            return jsonify({"error": "No title or description provided"}), 400
            
        import numpy as np
        query_vector = model.encode([query_text]).astype('float32')
        
        # Search for top matches
        D, I = index.search(query_vector, 6) # Top 6 to allow filtering
        candidate_indices = I[0]
        recommended_ids = df_meta.iloc[candidate_indices]['book_id'].tolist()
        
        results = []
        for match_id, score in zip(recommended_ids, D[0]):
            if int(match_id) == seed_id:
                continue
                
            row_matches = df_csv[df_csv['id'] == match_id]
            if not row_matches.empty:
                row = row_matches.iloc[0]
                # Filter out exactly matching titles
                if str(row.get('title', '')).lower() == seed_title.lower():
                    continue
                    
                cover = row.get('cover_url')
                if pd.isna(cover): cover = "https://via.placeholder.com/150x220?text=No+Cover"
                match_percentage = max(70.0, 100.0 - float(score)*15.0)
                
                results.append({
                    "id": int(row['id']),
                    "title": str(row['title']),
                    "author": str(row.get('authors', '')),
                    "cover_url": cover,
                    "match_score": round(match_percentage, 1)
                })
                if len(results) >= 3: break
                
        return jsonify({
            "status": "success",
            "based_on_book": seed_title,
            "recommendations": results
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/', methods=['GET'])
def api_index():
    return jsonify({"status": "recommender", "message": "running (FAISS fast mode)"})

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', '5001'))
    app.run(host='127.0.0.1', port=port, debug=True)
=======
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
>>>>>>> 214ea6c94b151641970906ae80d8582b1f1a2db5
