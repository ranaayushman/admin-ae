# Boards Papers API Specification

This document outlines the API requirements for managing Board Exam Papers (PYQ) and Sample Papers.

## Base URL

```
https://aspiring-engineers-api-dbbcfdascdezgvcx.centralindia-01.azurewebsites.net/api/v1
```

---

## Enums & Constants

### Paper Categories

```typescript
type PaperCategory =
  | "jee-main" // JEE Main PYQ
  | "jee-advanced" // JEE Advanced PYQ
  | "wbjee" // WBJEE PYQ
  | "neet" // NEET PYQ
  | "boards-10" // Class 10 Board PYQ
  | "boards-12" // Class 12 Board PYQ
  | "sample-10" // Class 10 Sample Papers
  | "sample-12"; // Class 12 Sample Papers
```

### Board Names

```typescript
type BoardName =
  | "CBSE" // Central Board of Secondary Education
  | "ICSE" // Indian Certificate of Secondary Education (Class 10)
  | "ISC" // Indian School Certificate (Class 12)
  | "WBCHSE" // West Bengal Council of Higher Secondary Education
  | "State"; // Generic State Board
```

### Subjects - Class 10

```typescript
type SubjectClass10 =
  | "Mathematics"
  | "Science"
  | "English"
  | "Social Science"
  | "Hindi"
  | "Computer Applications";
```

### Subjects - Class 12

```typescript
type SubjectClass12 =
  | "Physics"
  | "Chemistry"
  | "Mathematics"
  | "Biology"
  | "English"
  | "Computer Science"
  | "Accountancy"
  | "Business Studies"
  | "Economics";
```

---

## Data Models

### Paper Model

```typescript
interface Paper {
  _id: string; // MongoDB ObjectId
  category: PaperCategory; // Paper category (required)
  year: number; // Year of paper (e.g., 2024)
  title: string; // Display title
  paperDriveLink: string; // Google Drive link to paper PDF
  solutionDriveLink?: string; // Google Drive link to solution PDF
  videoSolutionLink?: string; // YouTube link to video solution
  subject?: string; // Subject (required for boards/sample)
  board?: BoardName; // Board name (required for boards/sample)
  displayOrder?: number; // Order for display (default: 1)
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}
```

---

## API Endpoints

### 1. Get Papers by Category

Retrieve all papers filtered by category with optional additional filters.

**Endpoint:** `GET /papers`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| category | PaperCategory | Yes | Paper category filter |
| board | BoardName | No | Filter by board name |
| subject | string | No | Filter by subject |
| year | number | No | Filter by year |
| limit | number | No | Pagination limit (default: 50) |
| skip | number | No | Pagination offset (default: 0) |
| sort | string | No | Sort field (default: "-year") |

**Request Example:**

```http
GET /papers?category=boards-10&board=CBSE&subject=Mathematics
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "papers": [
      {
        "_id": "64a7b8c9d1e2f3a4b5c6d7e8",
        "category": "boards-10",
        "year": 2024,
        "title": "CBSE Class 10 Mathematics Board Exam 2024",
        "paperDriveLink": "https://drive.google.com/file/d/xxx",
        "solutionDriveLink": "https://drive.google.com/file/d/yyy",
        "videoSolutionLink": "https://youtube.com/watch?v=zzz",
        "subject": "Mathematics",
        "board": "CBSE",
        "displayOrder": 1,
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "total": 25,
    "limit": 50,
    "skip": 0
  }
}
```

---

### 2. Get Single Paper

Retrieve a single paper by ID.

**Endpoint:** `GET /papers/:id`

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "64a7b8c9d1e2f3a4b5c6d7e8",
    "category": "boards-10",
    "year": 2024,
    "title": "CBSE Class 10 Mathematics Board Exam 2024",
    "paperDriveLink": "https://drive.google.com/file/d/xxx",
    "solutionDriveLink": "https://drive.google.com/file/d/yyy",
    "subject": "Mathematics",
    "board": "CBSE",
    "displayOrder": 1,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### 3. Create Paper

Create a new paper entry.

**Endpoint:** `POST /papers`

**Authorization:** Required (Admin only)

**Request Body:**

```json
{
  "category": "boards-10",
  "year": 2024,
  "title": "CBSE Class 10 Mathematics Board Exam 2024",
  "paperDriveLink": "https://drive.google.com/file/d/xxx",
  "solutionDriveLink": "https://drive.google.com/file/d/yyy",
  "videoSolutionLink": "https://youtube.com/watch?v=zzz",
  "subject": "Mathematics",
  "board": "CBSE",
  "displayOrder": 1
}
```

**Validation Rules:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| category | string | Yes | Must be valid PaperCategory enum |
| year | number | Yes | 2000 ≤ year ≤ 2030 |
| title | string | Yes | Min 5 characters |
| paperDriveLink | string | Yes | Valid URL |
| solutionDriveLink | string | No | Valid URL if provided |
| videoSolutionLink | string | No | Valid URL if provided |
| subject | string | Conditional | Required if category is boards-_ or sample-_ |
| board | string | Conditional | Required if category is boards-_ or sample-_, must be valid BoardName |
| displayOrder | number | No | Default: 1 |

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Paper created successfully",
  "data": {
    "_id": "64a7b8c9d1e2f3a4b5c6d7e8",
    "category": "boards-10",
    "year": 2024,
    "title": "CBSE Class 10 Mathematics Board Exam 2024",
    "paperDriveLink": "https://drive.google.com/file/d/xxx",
    "solutionDriveLink": "https://drive.google.com/file/d/yyy",
    "videoSolutionLink": "https://youtube.com/watch?v=zzz",
    "subject": "Mathematics",
    "board": "CBSE",
    "displayOrder": 1,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### 4. Update Paper

Update an existing paper.

**Endpoint:** `PUT /papers/:id`

**Authorization:** Required (Admin only)

**Request Body:** (partial update allowed)

```json
{
  "title": "Updated Title",
  "solutionDriveLink": "https://drive.google.com/file/d/new-solution"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Paper updated successfully",
  "data": {
    "_id": "64a7b8c9d1e2f3a4b5c6d7e8",
    "category": "boards-10",
    "year": 2024,
    "title": "Updated Title",
    "paperDriveLink": "https://drive.google.com/file/d/xxx",
    "solutionDriveLink": "https://drive.google.com/file/d/new-solution",
    "subject": "Mathematics",
    "board": "CBSE",
    "displayOrder": 1,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-16T14:20:00Z"
  }
}
```

---

### 5. Delete Paper

Delete a paper by ID.

**Endpoint:** `DELETE /papers/:id`

**Authorization:** Required (Admin only)

**Response:**

```json
{
  "success": true,
  "message": "Paper deleted successfully"
}
```

---

### 6. Bulk Create Papers

Create multiple papers at once.

**Endpoint:** `POST /papers/bulk`

**Authorization:** Required (Admin only)

**Request Body:**

```json
{
  "papers": [
    {
      "category": "boards-10",
      "year": 2024,
      "title": "CBSE Class 10 Mathematics Board Exam 2024",
      "paperDriveLink": "https://drive.google.com/file/d/xxx",
      "subject": "Mathematics",
      "board": "CBSE"
    },
    {
      "category": "boards-10",
      "year": 2024,
      "title": "CBSE Class 10 Science Board Exam 2024",
      "paperDriveLink": "https://drive.google.com/file/d/yyy",
      "subject": "Science",
      "board": "CBSE"
    }
  ]
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "2 papers created successfully",
  "data": {
    "created": 2,
    "papers": [...]
  }
}
```

---

### 7. Get Paper Statistics

Get count statistics for papers by category.

**Endpoint:** `GET /papers/stats`

**Response:**

```json
{
  "success": true,
  "data": {
    "jee-main": 15,
    "jee-advanced": 12,
    "wbjee": 8,
    "neet": 10,
    "boards-10": 45,
    "boards-12": 52,
    "sample-10": 30,
    "sample-12": 35,
    "total": 207
  }
}
```

---

### 8. Get Papers by Board and Class

Convenience endpoint for fetching all papers for a specific board and class.

**Endpoint:** `GET /papers/boards/:class/:board`

**Path Parameters:**
| Parameter | Description |
|-----------|-------------|
| class | "10" or "12" |
| board | BoardName (e.g., "CBSE") |

**Request Example:**

```http
GET /papers/boards/10/CBSE
```

**Response:**

```json
{
  "success": true,
  "data": {
    "pyq": [...],
    "samplePapers": [...],
    "subjects": ["Mathematics", "Science", "English", ...]
  }
}
```

---

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "category",
      "message": "Invalid category. Must be one of: jee-main, jee-advanced, wbjee, neet, boards-10, boards-12, sample-10, sample-12"
    }
  ]
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Authentication required"
}
```

### 403 Forbidden

```json
{
  "success": false,
  "message": "Admin access required"
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Paper not found"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## MongoDB Schema

```javascript
const PaperSchema = new Schema(
  {
    category: {
      type: String,
      enum: [
        "jee-main",
        "jee-advanced",
        "wbjee",
        "neet",
        "boards-10",
        "boards-12",
        "sample-10",
        "sample-12",
      ],
      required: true,
      index: true,
    },
    year: {
      type: Number,
      required: true,
      min: 2000,
      max: 2030,
      index: true,
    },
    title: {
      type: String,
      required: true,
      minlength: 5,
    },
    paperDriveLink: {
      type: String,
      required: true,
    },
    solutionDriveLink: {
      type: String,
    },
    videoSolutionLink: {
      type: String,
    },
    subject: {
      type: String,
      index: true,
    },
    board: {
      type: String,
      enum: ["CBSE", "ICSE", "ISC", "WBCHSE", "State"],
      index: true,
    },
    displayOrder: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  },
);

// Compound indexes for common queries
PaperSchema.index({ category: 1, year: -1 });
PaperSchema.index({ category: 1, board: 1, subject: 1 });
PaperSchema.index({ category: 1, board: 1, year: -1 });
```

---

## Frontend Usage Examples

### Fetching Boards PYQ

```typescript
// Get all Class 10 CBSE papers
const response = await api.get("/papers", {
  params: {
    category: "boards-10",
    board: "CBSE",
  },
});

// Get Class 12 Physics papers
const response = await api.get("/papers", {
  params: {
    category: "boards-12",
    subject: "Physics",
  },
});
```

### Creating a Paper

```typescript
const response = await api.post("/papers", {
  category: "sample-10",
  year: 2026,
  title: "CBSE Class 10 Mathematics Sample Paper 2026",
  paperDriveLink: "https://drive.google.com/file/d/xxx",
  solutionDriveLink: "https://drive.google.com/file/d/yyy",
  subject: "Mathematics",
  board: "CBSE",
  displayOrder: 1,
});
```

---

## Notes for Backend Team

1. **Google Drive Links**: Consider validating that paperDriveLink and solutionDriveLink are valid Google Drive sharing links (contain `drive.google.com`).

2. **Subject Validation**: Subject should be validated against the appropriate list based on the category (boards-10/sample-10 vs boards-12/sample-12).

3. **Board Validation**: When category is `boards-10`, board cannot be `ISC` (which is Class 12 only). When category is `boards-12`, board cannot be `ICSE` (which is Class 10 only).

4. **Caching**: Consider implementing caching for GET requests as paper data changes infrequently.

5. **Admin Middleware**: All POST/PUT/DELETE endpoints should be protected by admin middleware checking user role.

6. **Soft Delete**: Consider implementing soft delete for papers to allow recovery.
