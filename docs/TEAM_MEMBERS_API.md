# Team Members API Documentation

Base URL: `/api/v1/team-members`

---

## 1. Create Team Member (Admin Only)

**Endpoint:** `POST /api/v1/team-members`  
**Auth:** Required (Bearer Token, Admin Role)  
**Content-Type:** `application/json`

**Request Body:**

| Field        | Type     | Required | Description                          |
| ------------ | -------- | -------- | ------------------------------------ |
| name         | string   | Yes      | Full name, max 100 characters        |
| title        | string   | Yes      | Job title/role, max 100 characters   |
| imageBase64  | string   | Yes      | Base64 encoded profile image         |
| expertise    | string[] | Yes      | Array of skills (min 1 item)         |
| displayOrder | number   | No       | Display order on website (default 1) |
| isActive     | boolean  | No       | Visibility toggle (default true)     |

**Example Request:**

```json
{
  "name": "John Doe",
  "title": "Physics Educator",
  "imageBase64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk...",
  "expertise": ["Physics", "JEE Advanced", "NEET"],
  "displayOrder": 1,
  "isActive": true
}
```

**Response (201 Created):**

```json
{
  "_id": "64c9f1b2e4b0a1a2b3c4d5e6",
  "name": "John Doe",
  "title": "Physics Educator",
  "image": "https://storage.googleapis.com/.../team-members/team-member-uuid.png",
  "expertise": ["Physics", "JEE Advanced", "NEET"],
  "displayOrder": 1,
  "isActive": true,
  "createdAt": "2026-01-26T10:00:00.000Z",
  "updatedAt": "2026-01-26T10:00:00.000Z",
  "__v": 0
}
```

---

## 2. Get All Team Members (Public)

**Endpoint:** `GET /api/v1/team-members`  
**Auth:** Optional (Public)

**Query Parameters:**

| Param    | Type    | Description                                                       |
| -------- | ------- | ----------------------------------------------------------------- |
| isActive | boolean | Filter by active status (e.g., `true`/`false`)                    |
| sort     | string  | Sort field. Use `-` for descending. Default is `displayOrder` ASC |

**Example Request:**

```
GET /api/v1/team-members?isActive=true&sort=displayOrder
```

**Response (200 OK):**

```json
[
  {
    "_id": "64c9f1b2e4b0a1a2b3c4d5e6",
    "name": "John Doe",
    "title": "Physics Educator",
    "image": "https://storage.example.com/team-members/img1.png",
    "expertise": ["Physics"],
    "displayOrder": 1,
    "isActive": true,
    "createdAt": "2026-01-26T10:00:00.000Z",
    "updatedAt": "2026-01-26T10:00:00.000Z",
    "__v": 0
  },
  {
    "_id": "64c9f1b2e4b0a1a2b3c4d5e7",
    "name": "Jane Smith",
    "title": "Math Expert",
    "image": "https://storage.example.com/team-members/img2.png",
    "expertise": ["Mathematics"],
    "displayOrder": 2,
    "isActive": true,
    "createdAt": "2026-01-26T11:00:00.000Z",
    "updatedAt": "2026-01-26T11:00:00.000Z",
    "__v": 0
  }
]
```

---

## 3. Get Team Member by ID (Admin Only)

**Endpoint:** `GET /api/v1/team-members/:id`  
**Auth:** Required (Bearer Token, Admin Role)

**Response (200 OK):**

```json
{
  "_id": "64c9f1b2e4b0a1a2b3c4d5e6",
  "name": "John Doe",
  "title": "Physics Educator",
  "image": "https://storage.example.com/team-members/img1.png",
  "expertise": ["Physics"],
  "displayOrder": 1,
  "isActive": true,
  "createdAt": "2026-01-26T10:00:00.000Z",
  "updatedAt": "2026-01-26T10:00:00.000Z",
  "__v": 0
}
```

**Response (404 Not Found):**

```json
{
  "statusCode": 404,
  "message": "Team member with ID 64c9f1b2e4b0a1a2b3c4d5e6 not found",
  "error": "Not Found"
}
```

---

## 4. Update Team Member (Admin Only)

**Endpoint:** `PATCH /api/v1/team-members/:id`  
**Auth:** Required (Bearer Token, Admin Role)  
**Content-Type:** `application/json`

**Request Body (All fields optional):**

```json
{
  "name": "John Doe Updated",
  "title": "Senior Physics Educator",
  "imageBase64": "data:image/png;base64,...",
  "expertise": ["Physics", "JEE Advanced", "JEE Main"],
  "displayOrder": 2,
  "isActive": false
}
```

> **Note:** Providing `imageBase64` will replace the old image.

**Response (200 OK):**

```json
{
  "_id": "64c9f1b2e4b0a1a2b3c4d5e6",
  "name": "John Doe Updated",
  "title": "Senior Physics Educator",
  "image": "https://storage.example.com/team-members/new-image.png",
  "expertise": ["Physics", "JEE Advanced", "JEE Main"],
  "displayOrder": 2,
  "isActive": false,
  "createdAt": "2026-01-26T10:00:00.000Z",
  "updatedAt": "2026-01-26T12:30:00.000Z",
  "__v": 0
}
```

---

## 5. Delete Team Member (Admin Only)

**Endpoint:** `DELETE /api/v1/team-members/:id`  
**Auth:** Required (Bearer Token, Admin Role)

**Response (204 No Content):**

_(Empty response body)_

---

## Error Responses

### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Team member with ID xxx not found",
  "error": "Not Found"
}
```

---

## Frontend Integration

### Admin Panel (`admin-ae`)

The admin panel uses `lib/services/team.service.ts` for CRUD operations:

```typescript
import { teamService } from "@/lib/services/team.service";

// Create
const newMember = await teamService.createTeamMember(payload);

// Get all
const members = await teamService.getTeamMembers({ sort: "displayOrder" });

// Get by ID
const member = await teamService.getTeamMemberById(id);

// Update
const updated = await teamService.updateTeamMember(id, payload);

// Delete
await teamService.deleteTeamMember(id);
```

### Landing Page (`aspiring-engineers`)

The landing page fetches active team members for the Educators section:

```typescript
import { teamService } from "@/services/team.service";

// Get active members for display
const members = await teamService.getActiveTeamMembers();
// Equivalent to: GET /api/v1/team-members?isActive=true&sort=displayOrder
```

---

## Implementation Notes

### Image Handling

- Accept `imageBase64` in the request body
- Backend decodes and uploads to cloud storage (Google Cloud Storage)
- Store the resulting public URL in the `image` field
- Delete old image when updating with a new one
- Recommended image size: 400x400px (square)

### Authentication & Authorization

| Endpoint                 | Auth Required | Role   |
| ------------------------ | ------------- | ------ |
| GET /team-members        | No            | Public |
| GET /team-members/:id    | Yes           | Admin  |
| POST /team-members       | Yes           | Admin  |
| PATCH /team-members/:id  | Yes           | Admin  |
| DELETE /team-members/:id | Yes           | Admin  |

### Default Sorting

Return results sorted by:

1. `displayOrder` ASC (primary)
2. `createdAt` DESC (secondary)

### Validation Rules

- `name`: Required, 1-100 characters, trimmed
- `title`: Required, 1-100 characters, trimmed
- `imageBase64`: Required on create, must be valid base64 image (png, jpg, webp)
- `expertise`: Required array with at least 1 non-empty string
- `displayOrder`: Positive integer, default 1
- `isActive`: Boolean, default true
