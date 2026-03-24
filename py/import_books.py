import pandas as pd
import mysql.connector
import math

# ─── CONFIG — change these to match your MySQL setup ─────────────────────────
DB_CONFIG = {
    "host":     "localhost",
    "user":     "root",        # your MySQL username
    "password": "NewPassword123", # your MySQL password
    "database": "elibrary"     # your database name
}

CSV_PATH = "books.csv"  # place this script in the same folder as books.csv

# ─── Connect ──────────────────────────────────────────────────────────────────
print("Connecting to MySQL...")
conn = mysql.connector.connect(**DB_CONFIG)
cursor = conn.cursor()

# ─── Step 1: Add is_personal column if it doesn't exist ──────────────────────
print("Adding is_personal column if not exists...")
cursor.execute("""
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'books' 
    AND COLUMN_NAME = 'is_personal'
""")
col_exists = cursor.fetchone()[0]
if not col_exists:
    cursor.execute("ALTER TABLE books ADD COLUMN is_personal BOOLEAN DEFAULT FALSE")
    print("  Column added.")
else:
    print("  Column already exists, skipping.")

# ─── Step 2: Mark your existing 60 books as personal ─────────────────────────
print("Marking existing books as personal...")
cursor.execute("UPDATE books SET is_personal = TRUE WHERE is_personal IS NULL OR is_personal = FALSE")
conn.commit()

# ─── Step 3: Load CSV ─────────────────────────────────────────────────────────
print("Loading CSV...")
df = pd.read_csv(CSV_PATH)
df = df.dropna(subset=["title", "average_rating"])
df["original_publication_year"] = pd.to_numeric(df["original_publication_year"], errors="coerce")
df["average_rating"] = pd.to_numeric(df["average_rating"], errors="coerce")
df["description"] = df["description"].fillna("")
df["authors"] = df["authors"].fillna("Unknown")
df["image_url"] = df["image_url"].fillna("")

print(f"Total books in CSV: {len(df)}")

# ─── Step 4: Get existing titles to avoid duplicates ─────────────────────────
cursor.execute("SELECT LOWER(title) FROM books")
existing_titles = set(row[0] for row in cursor.fetchall())
print(f"Existing books in DB: {len(existing_titles)}")

# ─── Step 5: Insert new books ─────────────────────────────────────────────────
insert_query = """
    INSERT INTO books 
        (title, author, genre, emoji, rating, status, progress, list_name, 
         publication_year, keywords, cover_image, is_personal)
    VALUES 
        (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
"""

inserted = 0
skipped = 0

for _, row in df.iterrows():
    title = str(row["title"]).strip()
    
    # Skip if already exists
    if title.lower() in existing_titles:
        skipped += 1
        continue

    author      = str(row["authors"])[:255]
    rating      = float(row["average_rating"]) if not math.isnan(row["average_rating"]) else 0.0
    cover_image = str(row["image_url"])
    description = str(row["description"])[:1000]
    pub_year    = int(row["original_publication_year"]) if not math.isnan(row["original_publication_year"]) else None

    # Defaults for columns not in CSV
    genre       = "Fiction"     # default genre
    emoji       = "📖"          # default emoji
    status      = "wantToRead"  # default status
    progress    = 0
    list_name   = "wantToRead"
    keywords    = description[:200]  # use description as keywords
    is_personal = False              # NOT personal — discovered books

    cursor.execute(insert_query, (
        title, author, genre, emoji, rating, status, progress,
        list_name, pub_year, keywords, cover_image, is_personal
    ))
    inserted += 1

    # Commit every 500 rows for performance
    if inserted % 500 == 0:
        conn.commit()
        print(f"  Inserted {inserted} books so far...")

conn.commit()
cursor.close()
conn.close()

print(f"\n✅ Done!")
print(f"   Inserted : {inserted} new books")
print(f"   Skipped  : {skipped} duplicates")
print(f"   Total in DB should now be ~{len(existing_titles) + inserted}")