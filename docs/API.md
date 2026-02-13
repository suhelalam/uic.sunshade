# Sunshade API Documentation

Base URL: `http://localhost:3000/api` (or your deployed URL)

## Events Endpoints

### Get All Events
```
GET /api/events
```

**Response:**
```json
{
  "events": [
    {
      "id": "event-id",
      "title": "Event Title",
      "dateISO": "2026-02-12T10:00:00Z",
      "location": { "lng": -87.6477, "lat": 41.8719 },
      "address": "Building Name",
      "roomNumber": "201",
      "imageUrl": "https://...",
      "creatorPhotoUrl": "https://...",
      "details": "Event details",
      "extraInfo": "Extra info",
      "organizer": "Organization",
      "createdBy": "user-uid",
      "createdByName": "John Doe",
      "attendCount": 5,
      "attendees": {
        "anon-id-1": 1707817200000,
        "anon-id-2": 1707817300000
      }
    }
  ]
}
```

---

### Get Single Event
```
GET /api/events/{id}
```

**Parameters:**
- `id` (path): Event ID

**Response:** Same as single event object

---

### Create Event
```
POST /api/events
Authorization: Bearer {idToken}
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Event Title",
  "dateISO": "2026-02-12T10:00:00Z",
  "location": { "lng": -87.6477, "lat": 41.8719 },
  "uid": "user-uid",
  "email": "user@uic.edu",
  "displayName": "John Doe",
  "photoURL": "https://...",
  "address": "Building Name",
  "roomNumber": "201",
  "imageUrl": "https://...",
  "details": "Event details",
  "extraInfo": "Extra info",
  "organizer": "Organization"
}
```

**Required Fields:**
- `title`
- `dateISO`
- `location` (with `lng` and `lat`)
- `uid`
- `email` (must be @uic.edu)

**Response:**
```json
{
  "id": "new-event-id",
  "message": "Event created successfully"
}
```

---

### Update Event
```
PATCH /api/events/{id}
Authorization: Bearer {idToken}
Content-Type: application/json
```

**Request Body:** (all fields optional)
```json
{
  "uid": "user-uid",
  "email": "user@uic.edu",
  "title": "Updated Title",
  "dateISO": "2026-02-12T11:00:00Z",
  "location": { "lng": -87.6477, "lat": 41.8719 },
  "address": "New Building",
  "roomNumber": "301",
  "imageUrl": "https://...",
  "details": "Updated details",
  "extraInfo": "Updated extra info",
  "organizer": "Updated Organization"
}
```

**Response:**
```json
{
  "message": "Event updated successfully"
}
```

---

### Delete Event
```
DELETE /api/events/{id}
Authorization: Bearer {idToken}
Content-Type: application/json
```

**Request Body:**
```json
{
  "uid": "user-uid"
}
```

**Response:**
```json
{
  "message": "Event deleted successfully"
}
```

---

## Attendance Endpoints

### Attend Event
```
POST /api/events/{id}/attendance
Content-Type: application/json
```

**Request Body:**
```json
{
  "anonymousId": "device-or-user-id",
  "action": "attend"
}
```

**Response:**
```json
{
  "message": "Marked as attending"
}
```

---

### Unattend Event
```
POST /api/events/{id}/attendance
Content-Type: application/json
```

**Request Body:**
```json
{
  "anonymousId": "device-or-user-id",
  "action": "unattend"
}
```

**Response:**
```json
{
  "message": "Unmarked as attending"
}
```

---

## Upload Endpoints

### Upload Event Image
```
POST /api/upload
Authorization: Bearer {idToken}
Content-Type: multipart/form-data
```

**Form Data:**
- `file` (File): Image file
- `uid` (string): User ID

**Response:**
```json
{
  "imageUrl": "https://storage.googleapis.com/..."
}
```

---

## Buildings Endpoints

### Search UIC Buildings
```
GET /api/buildings/search?query=engineering
```

**Parameters:**
- `query` (string): Building name or address to search

**Response:**
```json
{
  "suggestions": [
    {
      "name": "Engineering Hall",
      "address": "851 S Morgan St, Chicago, IL 60607",
      "abbreviation": "ENG",
      "lng": -87.647844,
      "lat": 41.872321
    }
  ]
}
```

---

### Verify UIC Building
```
GET /api/buildings/verify?address=Engineering%20Hall
```

**Parameters:**
- `address` (string): Building address to verify

**Response:**
```json
{
  "isUicBuilding": true
}
```

---

## Authentication

For endpoints requiring authentication:

1. Sign in user with Firebase (client-side in Expo app)
2. Get ID token: `const token = await user.getIdToken()`
3. Include in Authorization header: `Authorization: Bearer {token}`

The API verifies:
- Token validity
- User email is @uic.edu (for create/update/delete)
- User owns the event (for update/delete)

---

## Error Responses

All errors return appropriate HTTP status codes:

- `400` - Bad Request (missing required fields)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (not owner of event or invalid email domain)
- `404` - Not Found (event doesn't exist)
- `500` - Server Error

Error response format:
```json
{
  "error": "Error message description"
}
```

---

## Usage Examples

### Expo App Setup

```typescript
import * as SecureStore from 'expo-secure-store';
import { auth } from '../config/firebase';

const API_BASE = 'http://localhost:3000/api'; // or your deployed URL

// Get auth token
async function getAuthToken() {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  return await user.getIdToken();
}

// Fetch all events
async function fetchEvents() {
  const response = await fetch(`${API_BASE}/events`);
  const data = await response.json();
  return data.events;
}

// Create event
async function createEvent(eventData: any) {
  const token = await getAuthToken();
  const user = auth.currentUser!;
  
  const response = await fetch(`${API_BASE}/events`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...eventData,
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
    }),
  });
  
  return await response.json();
}

// Attend event
async function attendEvent(eventId: string, anonymousId: string) {
  const response = await fetch(`${API_BASE}/events/${eventId}/attendance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      anonymousId,
      action: 'attend',
    }),
  });
  
  return await response.json();
}

// Upload image
async function uploadImage(file: File, uid: string, token: string) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('uid', uid);
  
  const response = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  });
  
  const data = await response.json();
  return data.imageUrl;
}

// Search buildings
async function searchBuildings(query: string) {
  const response = await fetch(`${API_BASE}/buildings/search?query=${encodeURIComponent(query)}`);
  const data = await response.json();
  return data.suggestions;
}
```

