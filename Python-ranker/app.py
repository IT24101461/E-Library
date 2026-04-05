<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 8b633b4794f990139a187f791f79171778bb2c11
#!/usr/bin/env python3
"""
AI-Scholar Recommendation Engine
Provides ML-powered book recommendations using FAISS vector search
"""

import os
import sys

# Windows console encoding fix
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

import pandas as pd
import numpy as np
import traceback
from flask import Flask, jsonify, request
from flask_cors import CORS
from sentence_transformers import SentenceTransformer, CrossEncoder
import faiss
import language_tool_python

# ============================================
# INITIALIZATION
# ============================================
print("=" * 60)
print("Starting AI-Scholar Recommendation Engine...")
print("=" * 60)

app = Flask(__name__)

# Enable CORS for all routes under /api/
CORS(app, 
     origins="*",
     methods=["GET", "POST", "OPTIONS"],
     allow_headers=["Content-Type"],
     supports_credentials=False)

print("✓ CORS enabled for all origins")

# ============================================
# LOAD MODELS
# ============================================
try:
    print("\n📝 Loading Grammar Checker...")
    grammar_tool = language_tool_python.LanguageTool('en-US')
    print("✓ Grammar Checker loaded")
except Exception as e:
    print(f"✗ Error loading Grammar Checker: {e}")
    print("  (Tip: Run 'pip install language-tool-python' if it's missing)")
    grammar_tool = None

try:
    print("\n📦 Loading Sentence Transformer model...")
    model = SentenceTransformer('all-MiniLM-L6-v2')
    print("✓ Sentence Transformer loaded")
except Exception as e:
    print(f"✗ Error loading Sentence Transformer: {e}")
    model = None

try:
    print("\n🔄 Loading Cross-Encoder for re-ranking...")
    cross_encoder = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')
    print("✓ Cross-Encoder loaded")
except Exception as e:
    print(f"✗ Error loading Cross-Encoder: {e}")
    cross_encoder = None

# ============================================
# LOAD DATABASE
# ============================================
try:
    print("\n🗃️  Loading FAISS index...")
    faiss_index = faiss.read_index("books.index")
    df_meta = pd.read_pickle("books_metadata.pkl")
    print(f"✓ FAISS index loaded ({len(df_meta)} books)")
except Exception as e:
    print(f"✗ Error loading FAISS index: {e}")
    faiss_index = None
    df_meta = None

try:
    print("\n📖 Loading book data from CSV...")
    df_csv = pd.read_csv("book.csv")
    print(f"✓ Book CSV loaded ({len(df_csv)} books)")
    
    # Normalize ID column
    if 'book_id' in df_csv.columns and 'id' not in df_csv.columns:
        df_csv['id'] = df_csv['book_id']
    elif 'bookId' in df_csv.columns and 'id' not in df_csv.columns:
        df_csv['id'] = df_csv['bookId']
    
    # Normalize cover URL column
    if 'cover_url' not in df_csv.columns:
        for col in ['image_url', 'images_url', 'image', 'cover']:
            if col in df_csv.columns:
                df_csv['cover_url'] = df_csv[col]
                break
    
    # Ensure description exists
    if 'description' not in df_csv.columns:
        df_csv['description'] = ''
    df_csv['description'] = df_csv['description'].fillna('')
    
    # Normalize author column
    if 'author' not in df_csv.columns:
        if 'authors' in df_csv.columns:
            df_csv['author'] = df_csv['authors']
        else:
            df_csv['author'] = 'Unknown'
    df_csv['author'] = df_csv['author'].fillna('Unknown')
    
except Exception as e:
    print(f"✗ Error loading CSV: {e}")
    df_csv = None

print("\n" + "=" * 60)
print("✅ AI Engine Ready!")
print("=" * 60 + "\n")

# ============================================
# HELPER FUNCTIONS
# ============================================
def get_book_from_csv(book_id):
    """Get book details from CSV by ID"""
    if df_csv is None or df_csv.empty:
        return None
    matches = df_csv[df_csv['id'] == book_id]
    return matches.iloc[0] if not matches.empty else None

def format_recommendation(db_row, match_score=0.0):
    """Format a book row into recommendation JSON"""
    try:
        cover = db_row.get('cover_url', '')
        if pd.isna(cover) or not cover:
            cover = "https://via.placeholder.com/150x220?text=No+Cover"
        
        return {
            "id": int(db_row.get('id', 0)),
            "title": str(db_row.get('title', 'Unknown')),
            "author": str(db_row.get('author', 'Unknown')),
            "cover_url": str(cover),
            "match_score": round(float(match_score), 1),
            "description": str(db_row.get('description', ''))[:200]  # Limit to 200 chars
        }
    except Exception as e:
        print(f"Error formatting recommendation: {e}")
        return None

# ============================================
# HEALTH CHECK
# ============================================
@app.route('/api/health', methods=['GET', 'OPTIONS'])
def health_check():
    """Check if API is healthy"""
    if request.method == 'OPTIONS':
        return '', 204
    
    return jsonify({
        "status": "ok",
        "service": "AI-Scholar Recommendation Engine",
        "model_loaded": model is not None,
        "index_loaded": faiss_index is not None,
        "csv_loaded": df_csv is not None,
        "grammar_loaded": grammar_tool is not None
    }), 200

# ============================================
# RECOMMENDATIONS BY TEXT
# ============================================
@app.route('/api/recommend/text', methods=['POST', 'OPTIONS'])
def recommend_by_text():
    """
    Get recommendations based on book title and description
    Request: {title: string, description: string, id: number}
    """
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        data = request.json or {}
<<<<<<< HEAD
        user_query = str(data.get('query', '')).strip()
=======
>>>>>>> 8b633b4794f990139a187f791f79171778bb2c11
        title = str(data.get('title', '')).strip()
        description = str(data.get('description', '')).strip()
        seed_id = int(data.get('id', 0))
        
<<<<<<< HEAD
        print(f"📋 Request: query='{user_query}' | title='{title[:30]}...' | desc='{description[:30]}...' | id={seed_id}")
        
        # Validate input
        query_text = user_query if user_query else f"{title} {description}".strip()
=======
        print(f"📋 Request: title='{title[:30]}...' | desc='{description[:30]}...' | id={seed_id}")
        
        # Validate input
        query_text = f"{title} {description}".strip()
>>>>>>> 8b633b4794f990139a187f791f79171778bb2c11
        if not query_text or not model or faiss_index is None:
            return jsonify({
                "status": "error",
                "message": "Invalid request or model not loaded",
                "recommendations": []
            }), 400
        
        # Encode and search
        try:
            query_vector = model.encode([query_text]).astype('float32')
<<<<<<< HEAD
            distances, indices = faiss_index.search(query_vector, 100)  # Get top 100, filter later
=======
            distances, indices = faiss_index.search(query_vector, 10)  # Get top 10, filter later
>>>>>>> 8b633b4794f990139a187f791f79171778bb2c11
        except Exception as e:
            print(f"Error during search: {e}")
            return jsonify({
                "status": "error",
                "message": "Search failed",
                "recommendations": []
            }), 500
        
        # Build recommendations
        results = []
        for match_id, distance in zip(indices[0], distances[0]):
<<<<<<< HEAD
            if len(results) >= 20:
=======
            if len(results) >= 3:
>>>>>>> 8b633b4794f990139a187f791f79171778bb2c11
                break
            
            try:
                # Get from metadata
                meta_row = df_meta.iloc[match_id]
                book_id = int(meta_row.get('book_id', 0))
                
                # Skip if same as seed
                if book_id == seed_id:
                    continue
                
                # Get full details from CSV
                csv_row = get_book_from_csv(book_id)
                if csv_row is None:
                    continue
                
                # Skip if exact title match
                if str(csv_row.get('title', '')).lower() == title.lower():
                    continue
                
                # Calculate match score
                match_score = max(70.0, 100.0 - float(distance) * 12.0)
                
                rec = format_recommendation(csv_row, match_score)
                if rec:
                    results.append(rec)
            except Exception as e:
                print(f"Error processing result: {e}")
                continue
        
        print(f"📚 Returning {len(results)} recommendations")
        return jsonify({
            "status": "success",
            "based_on_book": title,
            "recommendations": results
        }), 200
    
    except Exception as e:
        print(f"❌ Error in recommend/text: {e}")
        traceback.print_exc()
        return jsonify({
            "status": "error",
            "message": str(e),
            "recommendations": []
        }), 500

# ============================================
# RECOMMENDATIONS BY BOOK ID
# ============================================
@app.route('/api/recommend/<int:book_id>', methods=['GET', 'OPTIONS'])
def recommend_by_id(book_id):
    """Get recommendations for a specific book"""
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        print(f"🔖 Request: recommendations for book ID {book_id}")
        
        # Get seed book
        seed_book = get_book_from_csv(book_id)
        if seed_book is None:
            return jsonify({
                "status": "error",
                "message": f"Book {book_id} not found",
                "recommendations": []
            }), 404
        
        title = str(seed_book.get('title', ''))
        description = str(seed_book.get('description', ''))
        
        # Use text recommendation logic
        query_text = f"{title} {description}".strip()
        
        if not model or faiss_index is None:
            return jsonify({
                "status": "error",
                "message": "Model not loaded",
                "recommendations": []
            }), 500
        
        # Search
        query_vector = model.encode([query_text]).astype('float32')
        distances, indices = faiss_index.search(query_vector, 10)
        
        results = []
        for match_id, distance in zip(indices[0], distances[0]):
            if len(results) >= 3:
                break
            
            meta_row = df_meta.iloc[match_id]
            matched_book_id = int(meta_row.get('book_id', 0))
            
            if matched_book_id == book_id:
                continue
            
            csv_row = get_book_from_csv(matched_book_id)
            if csv_row is None:
                continue
            
            match_score = max(70.0, 100.0 - float(distance) * 12.0)
            rec = format_recommendation(csv_row, match_score)
            if rec:
                results.append(rec)
        
        print(f"📚 Returning {len(results)} recommendations for '{title}'")
        return jsonify({
            "status": "success",
            "based_on_book": title,
            "recommendations": results
        }), 200
    
    except Exception as e:
        print(f"❌ Error in recommend/id: {e}")
        traceback.print_exc()
        return jsonify({
            "status": "error",
            "message": str(e),
            "recommendations": []
        }), 500

# ============================================
# SPELLING & GRAMMAR
# ============================================
@app.route('/api/check-grammar', methods=['POST', 'OPTIONS'])
def check_grammar():
    """Check grammar and spelling for a given text"""
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        data = request.json or {}
        user_text = data.get('text', '')
        
        if not user_text:
            return jsonify({"status": "error", "message": "No text provided"}), 400
            
        if grammar_tool is None:
            return jsonify({"status": "error", "message": "Grammar tool is not loaded. Please contact administrator."}), 503
            
        # Run grammar check
        matches = grammar_tool.check(user_text)
        
<<<<<<< HEAD
=======
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
import pandas as pd
from flask import Flask, jsonify
from flask_cors import CORS
from sentence_transformers import SentenceTransformer
import faiss
import os
import math
<<<<<<< HEAD
import language_tool_python
=======
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520

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

<<<<<<< HEAD
# --- LOAD GRAMMAR TOOL ---
print("Loading Grammar Checker...")
# This creates a local grammar checker for US English
grammar_tool = language_tool_python.LanguageTool('en-US') 
print("Grammar Checker Loaded!")

=======
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
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

<<<<<<< HEAD
# --- SPELLING & GRAMMAR API ENDPOINT ---
@app.route('/api/check-grammar', methods=['POST'])
def check_grammar():
    try:
        # 1. Get the text the user typed in the React form
        from flask import request
        data = request.json
        user_text = data.get('text', '')

        if not user_text:
            return jsonify({"status": "error", "message": "No text provided"}), 400

        # 2. Run the grammar and spell check
        matches = grammar_tool.check(user_text)

        # 3. Format the mistakes nicely for React
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
>>>>>>> 8b633b4794f990139a187f791f79171778bb2c11
        mistakes = []
        for match in matches:
            error_len = getattr(match, 'errorLength', getattr(match, 'error_length', 0))
            mistakes.append({
                "mistake": user_text[match.offset : match.offset + error_len],
                "message": match.message,
                "suggestions": match.replacements[:3],
                "offset": match.offset,
                "length": error_len
            })
<<<<<<< HEAD
            
=======
<<<<<<< HEAD
            
=======

>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
>>>>>>> 8b633b4794f990139a187f791f79171778bb2c11
        return jsonify({
            "status": "success",
            "original_text": user_text,
            "mistakes_found": len(mistakes),
            "details": mistakes
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 8b633b4794f990139a187f791f79171778bb2c11
        }), 200
        
    except Exception as e:
        print(f"❌ Error in check-grammar: {e}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

# ============================================
# ROOT ENDPOINT
# ============================================
@app.route('/', methods=['GET'])
def index():
    """Root endpoint"""
    return jsonify({
        "service": "AI-Scholar Recommendation Engine",
        "status": "running",
        "version": "2.0",
        "endpoints": [
            "GET /api/health",
            "POST /api/recommend/text",
            "GET /api/recommend/<book_id>",
            "POST /api/check-grammar"
        ]
    }), 200

# ============================================
# ERROR HANDLERS
# ============================================
@app.errorhandler(404)
def not_found(error):
    return jsonify({"status": "error", "message": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"status": "error", "message": "Internal server error"}), 500

# ============================================
# RUN SERVER
# ============================================
if __name__ == '__main__':
    print("🚀 Starting Flask server on http://0.0.0.0:5000")
    print("Press CTRL+C to stop\n")
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=False,
        threaded=True
    )
<<<<<<< HEAD
=======
=======
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

=======
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', '5001'))
<<<<<<< HEAD
    app.run(host='127.0.0.1', port=port, debug=True)
=======
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
>>>>>>> 90e533a64b037985637d2a52a5bf42cda436d520
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
>>>>>>> 8b633b4794f990139a187f791f79171778bb2c11
