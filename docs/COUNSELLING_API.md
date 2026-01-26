# Counselling API Documentation

This document outlines the API endpoints required for managing the counselling feature, including pricing packages, features, and counsellors.

## Base URL

```
https://aspiring-engineers-api-dbbcfdascdezgvcx.centralindia-01.azurewebsites.net/api/v1
```

---

## 1. Counselling Packages

Manage pricing packages for JEE, NEET, and WBJEE counselling services.

### 1.1 Create Counselling Package

**Endpoint:** `POST /counselling-packages`

**Authentication:** Required (Admin)

**Request Body:**

```json
{
  "name": "JEE Premium Counselling",
  "slug": "jee-premium",
  "examType": "jee",
  "description": "Complete JEE counselling with personal mentorship",
  "shortDescription": "Premium package with 1-on-1 mentorship",
  "price": 4999,
  "discountPrice": 3999,
  "discountPercentage": 20,
  "currency": "INR",
  "validityDays": 180,
  "features": [
    {
      "title": "Personal Mentorship",
      "description": "1-on-1 sessions with IIT alumni",
      "included": true
    },
    {
      "title": "Choice Filling Assistance",
      "description": "Expert help with JoSAA choice filling",
      "included": true
    },
    {
      "title": "College Prediction Tool",
      "description": "AI-powered college predictions",
      "included": true
    },
    {
      "title": "Document Verification Support",
      "description": "Complete document checklist and verification",
      "included": true
    },
    {
      "title": "WhatsApp Support",
      "description": "24/7 WhatsApp support",
      "included": false
    }
  ],
  "maxSessions": 5,
  "sessionDuration": 30,
  "highlights": [
    "5 Personal Sessions",
    "IIT/NIT Alumni Mentors",
    "100% Refund if not satisfied"
  ],
  "counsellorIds": ["counsellor_id_1", "counsellor_id_2"],
  "badge": "Most Popular",
  "badgeColor": "#2596be",
  "isActive": true,
  "isFeatured": true,
  "displayOrder": 1,
  "termsAndConditions": "Terms apply. Sessions must be used within validity period."
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "_id": "pkg_123abc",
    "name": "JEE Premium Counselling",
    "slug": "jee-premium",
    "examType": "jee",
    "description": "Complete JEE counselling with personal mentorship",
    "shortDescription": "Premium package with 1-on-1 mentorship",
    "price": 4999,
    "discountPrice": 3999,
    "discountPercentage": 20,
    "currency": "INR",
    "validityDays": 180,
    "features": [...],
    "maxSessions": 5,
    "sessionDuration": 30,
    "highlights": [...],
    "counsellorIds": [...],
    "badge": "Most Popular",
    "badgeColor": "#2596be",
    "isActive": true,
    "isFeatured": true,
    "displayOrder": 1,
    "termsAndConditions": "...",
    "totalEnrollments": 0,
    "createdAt": "2026-01-26T10:00:00.000Z",
    "updatedAt": "2026-01-26T10:00:00.000Z"
  }
}
```

### 1.2 Get All Counselling Packages

**Endpoint:** `GET /counselling-packages`

**Authentication:** Optional (Public for active packages, Admin for all)

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `examType` | string | Filter by exam: `jee`, `neet`, `wbjee` |
| `isActive` | boolean | Filter active/inactive packages |
| `isFeatured` | boolean | Filter featured packages |
| `sort` | string | Sort field (e.g., `displayOrder`, `-price`) |

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "pkg_123abc",
      "name": "JEE Premium Counselling",
      "slug": "jee-premium",
      "examType": "jee",
      "price": 4999,
      "discountPrice": 3999,
      "features": [...],
      "isActive": true,
      "isFeatured": true,
      "displayOrder": 1,
      "totalEnrollments": 150
    }
  ],
  "pagination": {
    "total": 10,
    "page": 1,
    "limit": 20
  }
}
```

### 1.3 Get Single Counselling Package

**Endpoint:** `GET /counselling-packages/:id`

**Authentication:** Optional

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "_id": "pkg_123abc",
    "name": "JEE Premium Counselling",
    "slug": "jee-premium",
    "examType": "jee",
    "description": "Complete JEE counselling with personal mentorship",
    "price": 4999,
    "discountPrice": 3999,
    "features": [...],
    "counsellors": [
      {
        "_id": "counsellor_id_1",
        "name": "Dr. Rahul Sharma",
        "title": "Senior Counsellor",
        "image": "https://...",
        "qualifications": ["IIT Delhi", "10+ years experience"]
      }
    ],
    "isActive": true,
    "totalEnrollments": 150
  }
}
```

### 1.4 Get Package by Slug

**Endpoint:** `GET /counselling-packages/slug/:slug`

**Authentication:** Optional

**Response:** Same as Get Single Package

### 1.5 Update Counselling Package

**Endpoint:** `PATCH /counselling-packages/:id`

**Authentication:** Required (Admin)

**Request Body:** (Partial update - any fields from create)

```json
{
  "price": 5999,
  "discountPrice": 4499,
  "isActive": true,
  "features": [...]
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "_id": "pkg_123abc",
    ...updatedFields
  }
}
```

### 1.6 Delete Counselling Package

**Endpoint:** `DELETE /counselling-packages/:id`

**Authentication:** Required (Admin)

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Counselling package deleted successfully"
}
```

### 1.7 Reorder Packages

**Endpoint:** `PATCH /counselling-packages/reorder`

**Authentication:** Required (Admin)

**Request Body:**

```json
{
  "packages": [
    { "id": "pkg_123", "displayOrder": 1 },
    { "id": "pkg_456", "displayOrder": 2 },
    { "id": "pkg_789", "displayOrder": 3 }
  ]
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Packages reordered successfully"
}
```

---

## 2. Counsellors

Manage counsellor profiles who provide counselling services.

### 2.1 Create Counsellor

**Endpoint:** `POST /counsellors`

**Authentication:** Required (Admin)

**Request Body:**

```json
{
  "name": "Dr. Rahul Sharma",
  "title": "Senior Career Counsellor",
  "email": "rahul.sharma@aspiringengineers.com",
  "phone": "+919876543210",
  "imageBase64": "data:image/jpeg;base64,...",
  "bio": "Dr. Rahul Sharma is an IIT Delhi alumnus with over 10 years of experience in career counselling...",
  "shortBio": "IIT Delhi alumnus | 10+ years experience | 5000+ students guided",
  "qualifications": [
    "B.Tech from IIT Delhi",
    "MBA from IIM Ahmedabad",
    "Certified Career Counsellor"
  ],
  "specializations": [
    "JEE Counselling",
    "College Selection",
    "Career Planning"
  ],
  "examTypes": ["jee", "wbjee"],
  "experience": 10,
  "studentsGuided": 5000,
  "rating": 4.9,
  "totalReviews": 450,
  "languages": ["English", "Hindi", "Bengali"],
  "socialLinks": {
    "linkedin": "https://linkedin.com/in/rahulsharma",
    "twitter": "https://twitter.com/rahulsharma"
  },
  "availability": {
    "monday": { "start": "09:00", "end": "18:00" },
    "tuesday": { "start": "09:00", "end": "18:00" },
    "wednesday": { "start": "09:00", "end": "18:00" },
    "thursday": { "start": "09:00", "end": "18:00" },
    "friday": { "start": "09:00", "end": "18:00" },
    "saturday": { "start": "10:00", "end": "14:00" },
    "sunday": null
  },
  "isActive": true,
  "isFeatured": true,
  "displayOrder": 1
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "_id": "counsellor_123abc",
    "name": "Dr. Rahul Sharma",
    "title": "Senior Career Counsellor",
    "email": "rahul.sharma@aspiringengineers.com",
    "image": "https://storage.azure.com/counsellors/rahul-sharma.jpg",
    "bio": "...",
    "qualifications": [...],
    "specializations": [...],
    "examTypes": ["jee", "wbjee"],
    "experience": 10,
    "studentsGuided": 5000,
    "rating": 4.9,
    "totalReviews": 450,
    "isActive": true,
    "isFeatured": true,
    "displayOrder": 1,
    "createdAt": "2026-01-26T10:00:00.000Z",
    "updatedAt": "2026-01-26T10:00:00.000Z"
  }
}
```

### 2.2 Get All Counsellors

**Endpoint:** `GET /counsellors`

**Authentication:** Optional

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `examType` | string | Filter by exam: `jee`, `neet`, `wbjee` |
| `isActive` | boolean | Filter active counsellors |
| `isFeatured` | boolean | Filter featured counsellors |
| `sort` | string | Sort field (e.g., `displayOrder`, `-rating`) |

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "counsellor_123abc",
      "name": "Dr. Rahul Sharma",
      "title": "Senior Career Counsellor",
      "image": "https://...",
      "shortBio": "IIT Delhi alumnus | 10+ years experience",
      "specializations": ["JEE Counselling", "College Selection"],
      "examTypes": ["jee", "wbjee"],
      "experience": 10,
      "studentsGuided": 5000,
      "rating": 4.9,
      "totalReviews": 450,
      "isActive": true,
      "isFeatured": true
    }
  ]
}
```

### 2.3 Get Single Counsellor

**Endpoint:** `GET /counsellors/:id`

**Authentication:** Optional

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "_id": "counsellor_123abc",
    "name": "Dr. Rahul Sharma",
    "title": "Senior Career Counsellor",
    "image": "https://...",
    "bio": "Full bio...",
    "qualifications": [...],
    "specializations": [...],
    "availability": {...},
    ...allFields
  }
}
```

### 2.4 Update Counsellor

**Endpoint:** `PATCH /counsellors/:id`

**Authentication:** Required (Admin)

**Request Body:** (Partial update)

```json
{
  "title": "Principal Career Counsellor",
  "studentsGuided": 5500,
  "isActive": true
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "_id": "counsellor_123abc",
    ...updatedFields
  }
}
```

### 2.5 Delete Counsellor

**Endpoint:** `DELETE /counsellors/:id`

**Authentication:** Required (Admin)

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Counsellor deleted successfully"
}
```

### 2.6 Update Counsellor Rating

**Endpoint:** `PATCH /counsellors/:id/rating`

**Authentication:** Required (System/Admin)

**Description:** Called after a session review to update average rating

**Request Body:**

```json
{
  "newRating": 5,
  "reviewId": "review_123"
}
```

---

## 3. Counselling Enrollments

Track user enrollments in counselling packages.

### 3.1 Create Enrollment (After Payment)

**Endpoint:** `POST /counselling-enrollments`

**Authentication:** Required (User)

**Request Body:**

```json
{
  "packageId": "pkg_123abc",
  "paymentId": "pay_123xyz",
  "paymentMethod": "razorpay",
  "amountPaid": 3999,
  "couponCode": "EARLY20"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "_id": "enroll_123",
    "userId": "user_456",
    "packageId": "pkg_123abc",
    "package": {
      "name": "JEE Premium Counselling",
      "examType": "jee",
      "maxSessions": 5
    },
    "status": "active",
    "sessionsUsed": 0,
    "sessionsRemaining": 5,
    "paymentId": "pay_123xyz",
    "amountPaid": 3999,
    "enrolledAt": "2026-01-26T10:00:00.000Z",
    "expiresAt": "2026-07-26T10:00:00.000Z",
    "assignedCounsellor": null
  }
}
```

### 3.2 Get User Enrollments

**Endpoint:** `GET /counselling-enrollments/my`

**Authentication:** Required (User)

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "enroll_123",
      "package": {
        "_id": "pkg_123abc",
        "name": "JEE Premium Counselling",
        "examType": "jee"
      },
      "status": "active",
      "sessionsUsed": 2,
      "sessionsRemaining": 3,
      "expiresAt": "2026-07-26T10:00:00.000Z",
      "assignedCounsellor": {
        "_id": "counsellor_123",
        "name": "Dr. Rahul Sharma",
        "image": "https://..."
      }
    }
  ]
}
```

### 3.3 Get All Enrollments (Admin)

**Endpoint:** `GET /counselling-enrollments`

**Authentication:** Required (Admin)

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `packageId` | string | Filter by package |
| `userId` | string | Filter by user |
| `status` | string | `active`, `expired`, `cancelled` |
| `examType` | string | `jee`, `neet`, `wbjee` |

**Response (200 OK):**

```json
{
  "success": true,
  "data": [...enrollments],
  "pagination": {
    "total": 500,
    "page": 1,
    "limit": 20
  }
}
```

### 3.4 Assign Counsellor to Enrollment

**Endpoint:** `PATCH /counselling-enrollments/:id/assign-counsellor`

**Authentication:** Required (Admin)

**Request Body:**

```json
{
  "counsellorId": "counsellor_123abc"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "_id": "enroll_123",
    "assignedCounsellor": {
      "_id": "counsellor_123abc",
      "name": "Dr. Rahul Sharma"
    }
  }
}
```

### 3.5 Manual Enrollment (Admin)

**Endpoint:** `POST /counselling-enrollments/manual`

**Authentication:** Required (Admin)

**Request Body:**

```json
{
  "userId": "user_456",
  "packageId": "pkg_123abc",
  "counsellorId": "counsellor_123",
  "notes": "Complimentary enrollment for contest winner",
  "skipPayment": true
}
```

---

## 4. Counselling Sessions

Manage individual counselling sessions.

### 4.1 Book Session

**Endpoint:** `POST /counselling-sessions`

**Authentication:** Required (User)

**Request Body:**

```json
{
  "enrollmentId": "enroll_123",
  "preferredDate": "2026-02-01",
  "preferredTimeSlot": "10:00-10:30",
  "agenda": "Need help with JoSAA choice filling",
  "meetingPreference": "video"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "_id": "session_123",
    "enrollmentId": "enroll_123",
    "userId": "user_456",
    "counsellorId": "counsellor_123",
    "counsellor": {
      "name": "Dr. Rahul Sharma",
      "image": "https://..."
    },
    "scheduledDate": "2026-02-01T10:00:00.000Z",
    "duration": 30,
    "status": "scheduled",
    "agenda": "Need help with JoSAA choice filling",
    "meetingLink": null,
    "createdAt": "2026-01-26T10:00:00.000Z"
  }
}
```

### 4.2 Get User Sessions

**Endpoint:** `GET /counselling-sessions/my`

**Authentication:** Required (User)

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | `scheduled`, `completed`, `cancelled`, `no-show` |
| `upcoming` | boolean | Filter upcoming sessions |

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "session_123",
      "counsellor": {
        "name": "Dr. Rahul Sharma",
        "image": "https://..."
      },
      "scheduledDate": "2026-02-01T10:00:00.000Z",
      "duration": 30,
      "status": "scheduled",
      "meetingLink": "https://meet.google.com/abc-xyz"
    }
  ]
}
```

### 4.3 Get Counsellor Sessions (Admin/Counsellor)

**Endpoint:** `GET /counselling-sessions/counsellor/:counsellorId`

**Authentication:** Required (Admin/Counsellor)

**Response:** Array of sessions for that counsellor

### 4.4 Update Session Status

**Endpoint:** `PATCH /counselling-sessions/:id/status`

**Authentication:** Required (Admin/Counsellor)

**Request Body:**

```json
{
  "status": "completed",
  "notes": "Discussed JoSAA rounds and prepared choice list",
  "nextSteps": "Review updated choice list before Round 2"
}
```

### 4.5 Add Meeting Link

**Endpoint:** `PATCH /counselling-sessions/:id/meeting-link`

**Authentication:** Required (Admin/Counsellor)

**Request Body:**

```json
{
  "meetingLink": "https://meet.google.com/abc-xyz-123",
  "meetingPlatform": "google-meet"
}
```

### 4.6 Cancel Session

**Endpoint:** `PATCH /counselling-sessions/:id/cancel`

**Authentication:** Required (User/Admin)

**Request Body:**

```json
{
  "reason": "Unable to attend due to personal emergency",
  "reschedule": true
}
```

---

## 5. Session Reviews

Collect feedback after counselling sessions.

### 5.1 Submit Review

**Endpoint:** `POST /counselling-reviews`

**Authentication:** Required (User)

**Request Body:**

```json
{
  "sessionId": "session_123",
  "counsellorId": "counsellor_123",
  "rating": 5,
  "review": "Dr. Sharma was extremely helpful. He explained the entire JoSAA process clearly.",
  "wouldRecommend": true,
  "tags": ["knowledgeable", "patient", "helpful"]
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "_id": "review_123",
    "sessionId": "session_123",
    "userId": "user_456",
    "counsellorId": "counsellor_123",
    "rating": 5,
    "review": "...",
    "wouldRecommend": true,
    "tags": ["knowledgeable", "patient", "helpful"],
    "isPublished": false,
    "createdAt": "2026-01-26T10:00:00.000Z"
  }
}
```

### 5.2 Get Counsellor Reviews

**Endpoint:** `GET /counselling-reviews/counsellor/:counsellorId`

**Authentication:** Optional

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `isPublished` | boolean | Filter published reviews |
| `rating` | number | Filter by rating |
| `limit` | number | Number of reviews to return |

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "_id": "review_123",
        "user": {
          "name": "Amit K.",
          "avatar": "https://..."
        },
        "rating": 5,
        "review": "...",
        "tags": ["knowledgeable", "patient"],
        "createdAt": "2026-01-26T10:00:00.000Z"
      }
    ],
    "stats": {
      "averageRating": 4.9,
      "totalReviews": 450,
      "ratingDistribution": {
        "5": 400,
        "4": 40,
        "3": 8,
        "2": 2,
        "1": 0
      }
    }
  }
}
```

### 5.3 Publish/Unpublish Review (Admin)

**Endpoint:** `PATCH /counselling-reviews/:id/publish`

**Authentication:** Required (Admin)

**Request Body:**

```json
{
  "isPublished": true
}
```

---

## 6. Counselling Inquiries

Track leads from the guidance form.

### 6.1 Submit Inquiry (Public)

**Endpoint:** `POST /counselling-inquiries`

**Authentication:** Optional

**Request Body:**

```json
{
  "name": "Rahul Kumar",
  "email": "rahul@example.com",
  "phone": "+919876543210",
  "exam": "jee-main",
  "rank": "5000",
  "category": "general",
  "state": "West Bengal",
  "message": "Need guidance for JoSAA counselling",
  "source": "admission-guidance-page",
  "utmSource": "google",
  "utmMedium": "cpc",
  "utmCampaign": "jee-counselling-2026"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Thank you! Our counsellor will contact you within 24 hours.",
  "data": {
    "_id": "inquiry_123",
    "ticketNumber": "INQ-2026-00123"
  }
}
```

### 6.2 Get All Inquiries (Admin)

**Endpoint:** `GET /counselling-inquiries`

**Authentication:** Required (Admin)

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `exam` | string | Filter by exam type |
| `status` | string | `new`, `contacted`, `converted`, `closed` |
| `assignedTo` | string | Filter by assigned team member |
| `dateFrom` | date | Filter by date range |
| `dateTo` | date | Filter by date range |

**Response (200 OK):**

```json
{
  "success": true,
  "data": [...inquiries],
  "pagination": {...},
  "stats": {
    "total": 500,
    "new": 50,
    "contacted": 200,
    "converted": 150,
    "closed": 100
  }
}
```

### 6.3 Update Inquiry Status

**Endpoint:** `PATCH /counselling-inquiries/:id`

**Authentication:** Required (Admin)

**Request Body:**

```json
{
  "status": "contacted",
  "assignedTo": "team_member_id",
  "notes": "Called and explained packages. Interested in Premium plan.",
  "followUpDate": "2026-01-28T10:00:00.000Z"
}
```

---

## Data Models

### CounsellingPackage Schema

```javascript
{
  name: String (required),
  slug: String (required, unique),
  examType: String (enum: ['jee', 'neet', 'wbjee'], required),
  description: String,
  shortDescription: String,
  price: Number (required),
  discountPrice: Number,
  discountPercentage: Number,
  currency: String (default: 'INR'),
  validityDays: Number (required),
  features: [{
    title: String,
    description: String,
    included: Boolean
  }],
  maxSessions: Number,
  sessionDuration: Number (in minutes),
  highlights: [String],
  counsellorIds: [ObjectId -> Counsellor],
  badge: String,
  badgeColor: String,
  isActive: Boolean (default: true),
  isFeatured: Boolean (default: false),
  displayOrder: Number (default: 0),
  termsAndConditions: String,
  totalEnrollments: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

### Counsellor Schema

```javascript
{
  name: String (required),
  title: String (required),
  email: String (required, unique),
  phone: String,
  image: String,
  bio: String,
  shortBio: String,
  qualifications: [String],
  specializations: [String],
  examTypes: [String] (enum: ['jee', 'neet', 'wbjee']),
  experience: Number (years),
  studentsGuided: Number,
  rating: Number (0-5),
  totalReviews: Number,
  languages: [String],
  socialLinks: {
    linkedin: String,
    twitter: String
  },
  availability: {
    monday: { start: String, end: String },
    tuesday: { start: String, end: String },
    ...
  },
  isActive: Boolean (default: true),
  isFeatured: Boolean (default: false),
  displayOrder: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

### CounsellingEnrollment Schema

```javascript
{
  userId: ObjectId -> User (required),
  packageId: ObjectId -> CounsellingPackage (required),
  status: String (enum: ['active', 'expired', 'cancelled', 'refunded']),
  sessionsUsed: Number (default: 0),
  sessionsRemaining: Number,
  paymentId: String,
  paymentMethod: String,
  amountPaid: Number,
  couponCode: String,
  assignedCounsellor: ObjectId -> Counsellor,
  notes: String,
  enrolledAt: Date,
  expiresAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### CounsellingSession Schema

```javascript
{
  enrollmentId: ObjectId -> CounsellingEnrollment (required),
  userId: ObjectId -> User (required),
  counsellorId: ObjectId -> Counsellor (required),
  scheduledDate: Date (required),
  duration: Number (minutes),
  status: String (enum: ['scheduled', 'completed', 'cancelled', 'no-show', 'rescheduled']),
  agenda: String,
  notes: String,
  nextSteps: String,
  meetingLink: String,
  meetingPlatform: String,
  recordingLink: String,
  cancelReason: String,
  createdAt: Date,
  updatedAt: Date
}
```

### CounsellingReview Schema

```javascript
{
  sessionId: ObjectId -> CounsellingSession (required),
  userId: ObjectId -> User (required),
  counsellorId: ObjectId -> Counsellor (required),
  rating: Number (1-5, required),
  review: String,
  wouldRecommend: Boolean,
  tags: [String],
  isPublished: Boolean (default: false),
  adminNotes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### CounsellingInquiry Schema

```javascript
{
  ticketNumber: String (auto-generated),
  name: String (required),
  email: String (required),
  phone: String (required),
  exam: String (required),
  rank: String,
  category: String,
  state: String,
  message: String,
  status: String (enum: ['new', 'contacted', 'converted', 'closed']),
  assignedTo: ObjectId -> TeamMember,
  notes: String,
  followUpDate: Date,
  source: String,
  utmSource: String,
  utmMedium: String,
  utmCampaign: String,
  convertedToEnrollment: ObjectId -> CounsellingEnrollment,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Error Responses

All endpoints follow consistent error response format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "price",
        "message": "Price must be a positive number"
      }
    ]
  }
}
```

### Common Error Codes

| Code                 | HTTP Status | Description                   |
| -------------------- | ----------- | ----------------------------- |
| `VALIDATION_ERROR`   | 400         | Invalid request body          |
| `UNAUTHORIZED`       | 401         | Missing or invalid auth token |
| `FORBIDDEN`          | 403         | Insufficient permissions      |
| `NOT_FOUND`          | 404         | Resource not found            |
| `DUPLICATE_ENTRY`    | 409         | Slug/email already exists     |
| `ENROLLMENT_EXPIRED` | 400         | Enrollment has expired        |
| `NO_SESSIONS_LEFT`   | 400         | No remaining sessions         |
| `SERVER_ERROR`       | 500         | Internal server error         |

---

## Webhook Events (Optional)

For integrating with payment gateways and notification systems:

| Event                            | Trigger                 |
| -------------------------------- | ----------------------- |
| `counselling.enrollment.created` | New enrollment created  |
| `counselling.session.booked`     | Session scheduled       |
| `counselling.session.reminder`   | 24h/1h before session   |
| `counselling.session.completed`  | Session marked complete |
| `counselling.review.submitted`   | New review submitted    |
| `counselling.inquiry.new`        | New inquiry received    |

---

## Integration Notes

### Payment Flow

1. User selects package on frontend
2. Frontend creates Razorpay order via `/payments/create-order`
3. User completes payment on Razorpay
4. Razorpay webhook hits `/payments/webhook`
5. Backend creates enrollment via internal call
6. User redirected to success page with enrollment details

### Session Booking Flow

1. User views available slots based on counsellor availability
2. User books preferred slot
3. Admin/Counsellor confirms and adds meeting link
4. Reminder emails sent 24h and 1h before
5. After session, counsellor marks complete and adds notes
6. User prompted to leave review

### Frontend Service Integration

Create services in `aspiring-engineers/services/`:

- `counselling-packages.service.ts`
- `counsellors.service.ts`
- `counselling.service.ts` (enrollments, sessions)
