import urllib.request
import json
import urllib.error

url = 'http://localhost:8080/api/books?userId=17'
data = {
    "title": "Test Book",
    "author": "Test Author",
    "description": "Desc",
    "isbn": "12345",
    "totalPages": 100,
    "category": "Fiction",
    "publicationYear": 2026,
    "pdfUrl": "",
    "coverUrl": "",
    "content": "",
    "isAvailable": True
}

req = urllib.request.Request(url, method='POST')
req.add_header('Content-Type', 'application/json')
data_bytes = json.dumps(data).encode('utf-8')

try:
    response = urllib.request.urlopen(req, data=data_bytes)
    print("Success:", response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code}")
    print("Response Body:", e.read().decode('utf-8'))
except Exception as e:
    print(f"Other Error: {e}")
