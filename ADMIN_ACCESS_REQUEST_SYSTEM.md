# Admin Access Request System - Implementation Guide

## Overview
A complete admin access request workflow system where regular users can request admin privileges, and existing admins can review and approve/reject these requests.

## What Was Built

### Backend Changes (Java/Spring Boot)

#### 1. New Model: `AdminAccessRequest.java`
- **Location**: `backend/src/main/java/com/elibrary/model/AdminAccessRequest.java`
- **Fields**:
  - `id`: Primary key
  - `userId`: Reference to requesting user
  - `userEmail`: Requestor's email
  - `userName`: Requestor's name
  - `status`: PENDING, APPROVED, or REJECTED
  - `reason`: Why user wants admin access
  - `adminNotes`: Admin's notes on approval/rejection
  - `reviewedBy`: Admin who reviewed the request
  - `createdAt`: Request submission time
  - `reviewedAt`: Review completion time

#### 2. New Repository: `AdminAccessRequestRepository.java`
- **Location**: `backend/src/main/java/com/elibrary/repository/AdminAccessRequestRepository.java`
- **Methods**:
  - `findByUserIdAndStatus()`: Find pending requests for a user
  - `findByStatus()`: Get all requests by status
  - `findByUserId()`: Get all requests for a user
  - `findAllByOrderByCreatedAtDesc()`: Get all requests sorted by date

#### 3. New API Endpoints (AdminController.java)

**User Endpoints:**
- `POST /admin/access-request` - Submit admin access request
  - Body: `{ "reason": "string" }`
  - Returns: `{ "message": "...", "requestId": number }`
  - Only non-admin users can request

- `GET /admin/my-access-request` - Check user's own request status
  - Returns: Latest AdminAccessRequest or `{ "hasRequest": false }`

**Admin Endpoints:**
- `GET /admin/access-requests` - List pending requests only
  - Query param: `userId` (must be admin)
  - Returns: Array of pending AdminAccessRequest objects

- `GET /admin/access-requests/all` - List all requests (with history)
  - Query param: `userId` (must be admin)
  - Returns: Array of all AdminAccessRequest objects

- `PUT /admin/access-requests/{requestId}/approve` - Approve a request
  - Query param: `userId` (must be admin)
  - Body (optional): `{ "adminNotes": "string" }`
  - Effect: Sets user's role to ADMIN, updates request status

- `PUT /admin/access-requests/{requestId}/reject` - Reject a request
  - Query param: `userId` (must be admin)
  - Body: `{ "adminNotes": "string" }`
  - Effect: Keeps user role unchanged, records rejection reason

#### 4. Database Migration
- **Location**: `database/add_admin_access_requests.sql`
- Creates `admin_access_requests` table with proper indexes
- Foreign keys reference `users` table
- Run this SQL to set up the table

### Frontend Changes (React)

#### 1. New Component: `AdminRequestModal.jsx`
- **Location**: `frontend/src/components/AdminRequestModal.jsx`
- **Purpose**: Modal for users to request admin access
- **Features**:
  - Text area for explaining why they need admin access
  - Character count (max 500)
  - Submission loading state
  - Success confirmation screen
  - Error handling

#### 2. New Styles: `AdminRequestModal.css`
- **Location**: `frontend/src/styles/AdminRequestModal.css`
- Modern modal design with animations
- Responsive layout for mobile/tablet
- Success state styling

#### 3. New Component: `AdminAccessRequests.jsx`
- **Location**: `frontend/src/components/AdminAccessRequests.jsx`
- **Purpose**: Display and manage pending admin requests (admin-only)
- **Features**:
  - List pending requests
  - Filter between pending/all requests
  - Color-coded status badges
  - Individual approve/reject buttons
  - Request reason display
  - Review date and admin notes display
  - Loading and empty states

#### 4. New Styles: `AdminAccessRequests.css`
- **Location**: `frontend/src/styles/AdminAccessRequests.css`
- Card-based layout for requests
- Status-specific color coding
- Responsive design
- Hover effects and animations

#### 5. Updated: `ActivityDashboard.jsx`
- Added import for `AdminRequestModal`
- Added state: `showAdminRequest`
- Added button in hero section: "🔑 Request Admin Access" (only visible to non-admin users)
- Opens modal when clicked
- Shows success message after submission

#### 6. Updated: `AdminDashboard.jsx`
- Added import for `AdminAccessRequests`
- Added new tab: "Access Requests" with 🔑 icon
- New tab content displays the `AdminAccessRequests` component
- Updated tab navigation to include requests tab

## Usage Flow

### For Regular Users:
1. User logs in to dashboard
2. Views "🔑 Request Admin Access" button in hero section
3. Clicks button to open modal
4. Enters reason for requesting admin access
5. Submits request
6. Gets success confirmation
7. Waits for admin review

### For Admins:
1. Log in to admin dashboard
2. Navigate to "Access Requests" tab
3. See list of pending requests
4. View request details (user name, email, reason)
5. Click "Approve" to make user an admin
6. Or click "Reject" with optional notes
7. Can view approval history in "All" filter

## Database Structure

```sql
CREATE TABLE admin_access_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    user_email VARCHAR(255),
    user_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'PENDING',
    reason LONGTEXT,
    admin_notes LONGTEXT,
    reviewed_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id),
    KEY idx_status (status),
    KEY idx_user_id (user_id),
    KEY idx_created_at (created_at DESC)
);
```

## API Response Examples

### Submit Request:
```json
POST /admin/access-request?userId=123
{
  "reason": "I want to help manage the library"
}

Response (200):
{
  "message": "Admin access request submitted",
  "requestId": 456
}
```

### Get Pending Requests:
```json
GET /admin/access-requests?userId=1

Response (200):
[
  {
    "id": 456,
    "userId": 123,
    "userEmail": "user@example.com",
    "userName": "John Doe",
    "status": "PENDING",
    "reason": "I want to help manage the library",
    "createdAt": "2026-03-31T12:00:00",
    "reviewedAt": null,
    "adminNotes": null
  }
]
```

### Approve Request:
```json
PUT /admin/access-requests/456/approve?userId=1
{
  "adminNotes": "Approved - trusted member"
}

Response (200):
{
  "message": "Request approved",
  "userId": 123,
  "newRole": "ADMIN"
}
```

## Setup Instructions

### 1. Database Setup
```bash
# Login to MySQL and run:
SOURCE database/add_admin_access_requests.sql;
```

### 2. Backend
- No additional dependencies needed
- Automatically picks up the new model and repository
- Restart backend service: `mvn spring-boot:run`

### 3. Frontend
- All components already integrated
- Just refresh the browser after backend restart

## Security Considerations

✅ **Implemented**:
- Only admins can view/approve/reject requests
- Only non-admin users can request access
- Request status is immutable (can't change approved requests)
- Admin notes only visible to admins
- Reviewer tracking (who approved/rejected)

⚠️ **Additional Considerations**:
- Consider adding email notifications for approvals/rejections
- Implement request expiration (auto-reject after 30 days)
- Add audit logging for approval decisions
- Optionally require multiple admin approvals for security-sensitive requests

## Testing

### Manual Testing Checklist:
1. ✅ Regular user sees "Request Admin Access" button
2. ✅ Admin user doesn't see the button
3. ✅ Clicking button opens modal
4. ✅ Can submit request with reason
5. ✅ Admin sees request in "Access Requests" tab
6. ✅ Can approve request → user becomes admin
7. ✅ Can reject request → shows in history
8. ✅ Can filter between pending and all requests
9. ✅ Approved user can log out and back in as admin
10. ✅ User can't submit duplicate pending requests

## Troubleshooting

**Issue**: Table doesn't exist error
- **Solution**: Run the SQL migration script first

**Issue**: Modal doesn't open
- **Solution**: Check that userId is being passed correctly from authUser

**Issue**: Approve/Reject buttons don't work
- **Solution**: Ensure backend service is running and userId in localStorage is valid admin

**Issue**: Users don't see their request status
- **Solution**: Check `/admin/my-access-request` endpoint is returning correct data
