# Test Series Modes & Delivery Policy - QA Checklist

## Pre-QA Setup
- [ ] Ensure backend is running at `{{API}}/api/v1`
- [ ] Admin user logged in with valid auth token
- [ ] Question bank has at least 200+ questions across multiple categories
- [ ] Questions have metadata: difficulty, subject, chapter, topic, marks

---

## QA Scenario 1: Random Mode with fixed-per-user

### Create Test
- [ ] Navigate to Test Series > Create Test
- [ ] Fill in test details:
  - Title: "Random Physics Test - Fixed"
  - Category: "JEE Main"
  - Duration: 180 minutes
  - Marks/Qs: 4
  - Negative: -1
- [ ] Select "Random" for Question Selection Mode
- [ ] Select "Fixed Per User" for Delivery Policy
- [ ] Enter "100" for Questions Per User
- [ ] Toggle "Ensure Subject Distribution"
- [ ] Set Physics: 50, Chemistry: 25, Maths: 25
- [ ] **Do NOT add any questions manually** (Random mode)
- [ ] Click "Create Test"
- [ ] ✅ Verify: Toast shows "Test created successfully"
- [ ] ✅ Verify: Redirected to test list

### Start First Attempt
- [ ] Open created test
- [ ] Click "Start Attempt"
- [ ] Record first 5 question IDs (for verification)
- [ ] Submit test
- [ ] Wait for test to be marked complete

### Start Second Attempt (Same User)
- [ ] Click "Take Again" or "New Attempt"
- [ ] ✅ **Verify: SAME 100 questions appear in same order**
- [ ] Capture screenshot showing first 5 questions match
- [ ] Navigate out

### Start Second Attempt (Different User)
- [ ] Log out, create different user account
- [ ] Log in as new user
- [ ] Navigate to same test
- [ ] Start attempt
- [ ] ✅ **Verify: Different 100 questions are delivered** (may be different from first user)
- [ ] Complete attempt

### Resume Test
- [ ] Go back to test as first user
- [ ] Start new attempt and answer 10 questions
- [ ] Click "Save & Resume"
- [ ] Come back to test
- [ ] Click "Resume"
- [ ] ✅ **Verify: Same questions shown, same position saved**
- [ ] ✅ **Verify: Answers are retained**

---

## QA Scenario 2: Random Mode with fresh-each-attempt

### Create Test
- [ ] Create new test with:
  - Title: "Random Physics Test - Fresh"
  - Question Selection: "Random"
  - Delivery Policy: "Fresh Each Attempt"
  - Questions Per User: 50
  - No subject distribution
- [ ] Create Test successfully

### First Attempt
- [ ] Start attempt
- [ ] Take note of 5 first question IDs
- [ ] Submit test

### Second Attempt
- [ ] Attempt test again
- [ ] **Verify: Questions are DIFFERENT from first attempt** (with high probability)
- [ ] OR if random picks same Qs, at least the order should differ
- [ ] Close attempt

### Third Attempt
- [ ] Start third attempt
- [ ] **Verify: Again, likely different question set**

---

## QA Scenario 3: Selected Mode (Manual Questions Only)

### Create Test
- [ ] Create test:
  - Title: "Handpicked Select Test"
  - Question Selection: "Selected"
  - Delivery Policy: "Fixed Per User"
- [ ] "Add Question" button appears
- [ ] Click "Add Question"
- [ ] Select 20 questions manually (mix of difficulties)
- [ ] ✅ Verify: Questions appear in the list below
- [ ] ✅ Verify: Total marks = 20 × 4 = 80 shown
- [ ] Create Test

### Verify Test Creation
- [ ] ✅ Test created with exactly the 20 selected questions
- [ ] ✅ No random questions added
- [ ] Take test as user
- [ ] ✅ Verify: Same 20 questions appear

### Second Attempt
- [ ] ✅ Verify: Same 20 questions, same order (fixed-per-user)

### Try to Remove Question
- [ ] Go back to first attempt midway
- [ ] ✅ Verify: Can't remove questions (test is already started)

---

## QA Scenario 4: Mixed Mode

### Create Test
- [ ] Create test:
  - Title: "Mixed Test 50+100"
  - Question Selection: "Mixed"
  - Questions Per User: 150
  - Delivery Policy: "Fixed Per User"
- [ ] Ensure Subject Distribution: YES
- [ ] Add 50 selected questions manually
- [ ] ✅ Verify: Form shows "Selected: 50 / 150 total (100 will be randomly added)"
- [ ] Subject Counts: Physics 60, Chemistry 50, Maths 40
- [ ] Create Test

### Verify Backend Logic
- [ ] Start attempt
- [ ] ✅ Verify: First 50 Qs are the exact selecting selected questions (fixed part)
- [ ] ✅ Verify: Next ~100 Qs are randomly selected
- [ ] ✅ Total: ~150 questions
- [ ] Take note of structure

### Second Attempt
- [ ] ✅ Verify: Same 150 questions (fixed-per-user)
- [ ] ✅ Verify: Same order as first attempt

### Fresh Attempt with Different Policy
- [ ] Create NEW test with same setup but "Fresh Each Attempt"
- [ ] First attempt: Record first 50 (fixed) + random 100
- [ ] Second attempt: ✅ First 50 should be SAME (fixed part) + different 100 (random)

---

## QA Scenario 5: API Payload Validation

### Test Invalid Payloads

#### Selected Mode without Questions
- [ ] Try to create selected mode test without adding questions
- [ ] CLI: `curl -X POST /tests -d '{"questionSelectionMode":"selected"}' ...`
- [ ] ✅ Expect: 400 error from frontend validation
- [ ] ✅ Or 400 from server

#### Mixed Mode with questionsPerUser ≤ selectedCount
- [ ] Try to create with 100 selected but 50 total questions
- [ ] ✅ Frontend shows validation error
- [ ] ✅ Error message: "Total questions must be greater than selected"

#### Random Mode without questionsPerUser
- [ ] Try random mode with questionsPerUser = 0 or empty
- [ ] ✅ Frontend validation prevents submit
- [ ] ✅ Error shown

---

## QA Scenario 6: Auto-Create with Modes

### Auto-Create Random
- [ ] (To be enabled when auto-create form is updated)
- [ ] Use auto-create with mode = "random"
- [ ] Verify test is created with random mode

### Auto-Create Mixed
- [ ] Auto-create with mode = "mixed"
- [ ] Verify selected questions from selectedQuestionIds + random

---

## QA Scenario 7: Answer Key & Results

### Start Test and Submit
- [ ] (Using any test mode)
- [ ] Take test
- [ ] Submit all answers
- [ ] ✅ Verify: Test marked complete

### Check Answer Key
- [ ] Open result / answer key
- [ ] ✅ Verify: GET /results/:attemptId/answer-key returns:
  ```json
  {
    "data": {
      "questions": [
        {
          "id": "q1",
          "correctAnswer": "A",
          "solutionText": "...",
          "solutionImageUrl": "..."
        }
      ]
    }
  }
  ```

---

## QA Scenario 8: UI/UX Verification

### Mode Selection UI
- [ ] ✅ Three radio buttons / select options clearly visible
- [ ] ✅ Helpful descriptions under each mode
- [ ] ✅ Selecting mode updates form dynamically

### Delivery Policy UI
- [ ] ✅ Two options clearly labeled
- [ ] ✅ Description changes based on selection
- [ ] ✅ Default is "Fixed Per User"

### Dynamic Form Fields
- [ ] ✅ "Questions Per User" only shows for Random/Mixed
- [ ] ✅ Subject distribution checkbox only for Random/Mixed
- [ ] ✅ No question selector shown for Random mode
- [ ] ✅ Question selector shown for Selected/Mixed modes

### Question Selector
- [ ] ✅ Can add questions one by one
- [ ] ✅ Shows added questions with order number
- [ ] ✅ Can remove individual questions
- [ ] ✅ Can reorder (if implemented)
- [ ] ✅ Shows question metadata (difficulty, category, marks)

### Error Handling
- [ ] Try invalid inputs
- [ ] ✅ Error messages appear under relevant fields
- [ ] ✅ Toast shows error summary
- [ ] ✅ Red error border on fields with issues
- [ ] ✅ Submit button stays disabled until errors cleared

---

## QA Scenario 9: Edit Test Mode Fields (When Implemented)

- [ ] Open existing test in edit mode
- [ ] ✅ Verify: Current mode shown as selected
- [ ] ✅ Verify: Current delivery policy shown
- [ ] ✅ Verify: questionsPerUser populated
- [ ] Try changing mode
- [ ] ✅ Verify: Form updates accordingly
- [ ] Update test
- [ ] ✅ Verify: Changes saved and reflected on dashboard

---

## QA Scenario 10: Auto-Create Form (When Implemented)

- [ ] Open Test Series page
- [ ] Click "Auto Create Test"
- [ ] ✅ Verify: Mode selector visible
- [ ] ✅ Verify: Delivery policy selector visible
- [ ] Fill auto-create form with Mixed mode
- [ ] Add selected questions
- [ ] Set questionsPerUser
- [ ] Enable subject distribution
- [ ] Submit
- [ ] ✅ Verify: Test created with correct mode

---

## Performance & Edge Cases

### Large Question Pools
- [ ] Test with 1000+ questions in random mode
- [ ] ✅ Verify: Load time acceptable (< 5 sec)
- [ ] ✅ Verify: Questions deliver on time

### Many Selected Questions
- [ ] Create test with 200 manually selected questions
- [ ] ✅ Verify: Form doesn't lag
- [ ] ✅ Verify: List scrolls smoothly

### Concurrent Users
- [ ] Multiple users start same test simultaneously
- [ ] ✅ Verify: Each gets their own question set (if fresh-each)
- [ ] ✅ Verify: No question collisions

### Resume Across Server Restarts
- [ ] Start test
- [ ] Save after question 10
- [ ] Restart backend
- [ ] Resume test as user
- [ ] ✅ Verify: Same questions, same position

---

## Payload Examples for Testing

### cURL - Create Random Test
```bash
curl -X POST http://localhost:3000/api/v1/tests \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "JEE Random Test",
    "description": "Full length mock",
    "category": "jee-main",
    "duration": 180,
    "marksPerQuestion": 4,
    "negativeMarking": -1,
    "status": "published",
    "type": "mock",
    "shuffleQuestions": true,
    "questionSelectionMode": "random",
    "questionDeliveryPolicy": "fixed-per-user",
    "questionsPerUser": 150,
    "ensureSubjectDistribution": true,
    "subjectQuestionCounts": {
      "Physics": 50,
      "Chemistry": 50,
      "Mathematics": 50
    }
  }'
```

### cURL - Create Selected Test
```bash
curl -X POST http://localhost:3000/api/v1/tests \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Handpicked Test",
    "description": "Admin selected questions",
    "category": "neet",
    "duration": 120,
    "marksPerQuestion": 4,
    "negativeMarking": -1,
    "status": "published",
    "questionSelectionMode": "selected",
    "questionDeliveryPolicy": "fixed-per-user",
    "selectedQuestionIds": ["q1", "q2", "q3", "..."]
  }'
```

### cURL - Create Mixed Test
```bash
curl -X POST http://localhost:3000/api/v1/tests \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Mixed Test",
    "category": "jee-main",
    "duration": 180,
    "marksPerQuestion": 4,
    "questionSelectionMode": "mixed",
    "questionDeliveryPolicy": "fresh-each-attempt",
    "questionsPerUser": 150,
    "selectedQuestionIds": ["q1", "q2", "...", "q50"],
    "ensureSubjectDistribution": true,
    "subjectQuestionCounts": {
      "Physics": 60,
      "Chemistry": 50,
      "Mathematics": 40
    }
  }'
```

---

## Test Result Template

| Test Scenario | Expected | Actual | Status | Notes |
|---|---|---|---|---|
| Random + Fixed: 1st attempt | 100 Qs | ? | ☐ | |
| Random + Fixed: 2nd attempt | Same 100 Qs | ? | ☐ | |
| Random + Fresh: 1st attempt | 100 Qs (set A) | ? | ☐ | |
| Random + Fresh: 2nd attempt | ~100 Qs (set B) | ? | ☐ | Different |
| Selected: Manual 20 questions | Exactly 20 | ? | ☐ | |
| Mixed: 50+100 questions | 50 fixed + 100 random | ? | ☐ | |
| Subject Distribution | 50:25:25 ratio | ? | ☐ | Within 10% acceptable |
| API 400 error handling | Validation error shown | ? | ☐ | |
| Answer key response | Contains solutions | ? | ☐ | |

---

## Sign-Off

- [ ] All 10 scenarios tested
- [ ] No blocking bugs found
- [ ] UX is intuitive
- [ ] Performance acceptable
- [ ] API payloads correct
- [ ] Error handling works

**Tested By:** ___________________  
**Date:** ___________________  
**Status:** ☐ PASS ☐ FAIL ☐ PARTIAL
