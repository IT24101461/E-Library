from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS
import faiss
import pandas as pd
from sentence_transformers import SentenceTransformer, CrossEncoder
import numpy as np

app = Flask(__name__)
CORS(app)

# Load Stage 1: Bi-Encoder (for speed)
bi_encoder = SentenceTransformer('all-MiniLM-L6-v2')
# Load Stage 2: Cross-Encoder (for "Hard" Accuracy)
cross_encoder = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')

# Load the AI Database
index = faiss.read_index("books.index")
df = pd.read_pickle("books_metadata.pkl")


@app.route('/chat', methods=['POST'])
def advanced_bot():
    user_query = request.json.get('message', '')

    # --- STAGE 1: Retrieval ---
    query_vector = bi_encoder.encode([user_query]).astype('float32')
    # Get top 30 candidates quickly
    D, I = index.search(query_vector, 30)
    candidate_indices = I[0]
    candidates = df.iloc[candidate_indices].copy()

    # --- STAGE 2: Re-ranking (The "Hard" Part) ---
    # We pair the user query with each candidate description
    pairs = [[user_query, desc] for desc in candidates['description']]
    # The Cross-Encoder predicts how relevant each pair is
    scores = cross_encoder.predict(pairs)
    candidates['rel_score'] = scores

    # Sort by the new, more accurate score
    top_books = candidates.sort_values(by='rel_score', ascending=False).head(5)

    # --- RESPONSE GENERATION ---
    results = []
    for _, book in top_books.iterrows():
        results.append({
            "title": book['title'],
            "author": book['authors'],
            "image": book['image_url'],
            "summary": book['description'][:150] + "..."
        })

    reply = f"Based on your request, I've analyzed the library and re-ranked these as your best matches:"
    return jsonify({"reply": reply, "books": results})


# Add your HTML code here (same as before)

if __name__ == '__main__':
    app.run(port=5000, debug=False)