import requests
import json
import time

# Give backend time to start if needed
print("Testing search history API...")

# First, get a valid user ID - let's use user ID 1
url = "http://localhost:8080/api/search-history"
payload = {"userId": 1, "searchQuery": "test query"}

try:
    response = requests.post(url, json=payload, timeout=5)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        print("✓ Search history saved successfully!")
    else:
        print(f"✗ Error: {response.status_code}")
        
except requests.exceptions.ConnectionError:
    print("✗ Cannot connect to backend at http://localhost:8080")
    print("  Is the backend running?")
except Exception as e:
    print(f"✗ Error: {e}")
