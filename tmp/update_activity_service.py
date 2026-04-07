import os

file_path = r'c:\Users\user\OneDrive - Sri Lanka Institute of Information Technology\Documents\AI\E-Library\backend\src\main\java\com\elibrary\service\ActivityService.java'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Update dailyLimit
content = content.replace('int dailyLimit = isPremium ? 10 : 1;', 'int dailyLimit = isPremium ? 10 : 2;')

# Update error message
old_msg = 'Standard users can only borrow 1 book per day. Upgrade to Premium Scholar for 10 books/day!'
new_msg = 'Standard users can only borrow 2 books per day. Upgrade to Premium Scholar for 10 books/day!'
content = content.replace(old_msg, new_msg)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("ActivityService.java updated successfully.")
