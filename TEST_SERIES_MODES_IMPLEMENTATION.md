# Test Series Implementation - Question Selection Modes & Delivery Policy

## Status: IN PROGRESS ✅ (50%)

### Completed Components

#### 1. **Backend Service Types** ✅
File: `lib/services/test.service.ts`
- Added enums:
  - `QuestionSelectionMode` = "random" | "selected" | "mixed"
  - `QuestionDeliveryPolicy` = "fixed-per-user" | "fresh-each-attempt"
- Extended `CreateTestPayload` with:
  - `questionSelectionMode`
  - `questionDeliveryPolicy`
  - `questionsPerUser`
  - `selectedQuestionIds`
  - `ensureSubjectDistribution`
  - `subjectQuestionCounts`
- Extended `AutoCreateTestPayload` with same new fields
- Extended `AdminTestData` interface for API responses

#### 2. **Validation Schema** ✅
File: `lib/validations/test-series-schema.ts`
- Comprehensive `testSeriesSchema` with mode-specific validation:
  - **Random mode**: Requires `questionsPerUser`
  - **Selected mode**: Requires `selectedQuestionIds` with at least 1 question
  - **Mixed mode**: Requires both `selectedQuestionIds` AND `questionsPerUser > selectedCount`
  - Subject distribution validation
  - Delivery policy selection

#### 3. **Test Create Page** ✅
File: `app/(dashboard)/test-series/create/page.tsx`
- Question Selection & Delivery Card:
  - Mode selector (Radio/Select)
  - Delivery Policy selector
  - Dynamic form fields based on mode
  - Subject distribution UI with per-subject question counts
- Dynamic Questions Section:
  - Shows helper text based on selected mode
  - "Random Mode" shows info message (no manual selection)
  - "Selected/Mixed" modes show question selector and added questions list
  - Proper validation before submit
- Mode-aware submit logic:
  - Constructs correct payload based on mode
  - Validates mode-specific requirements
  - Sends appropriate fields to backend

---

## Remaining Tasks

### 4. **Auto-Create Form Enhancement** ⏳
File: `app/(dashboard)/test-series/page.tsx`
- Need to add mode and delivery policy to the auto-create dialog
- Update `autoCreateForm` state to include:
  - `questionSelectionMode`
  - `questionDeliveryPolicy`
  - `questionsPerUser`
  - `selectedQuestionIds`
  - `ensureSubjectDistribution`
  - `subjectQuestionCounts`
- Update form UI to show mode and delivery policy selectors
- Pass these fields to `testService.autoCreateTest()`

### 5. **Test Edit Page Enhancement** ⏳
File: `app/(dashboard)/test-series/[id]/edit/page.tsx`
- Add same Question Selection & Delivery Card from create page
- Load existing mode and delivery policy from test data
- Support updating these fields
- Handle mode change logic when editing existing tests

### 6. **QA & Testing Documentation** ⏳
Create comprehensive testing guide with:
- Test scenarios for each mode
- Test scenarios for each delivery policy
- Integration test examples
- API payload examples

---

## API Integration Details

### Supported Payloads

#### Random Mode
```json
{
  "title": "JEE Main Mock Test",
  "questionSelectionMode": "random",
  "questionDeliveryPolicy": "fixed-per-user",
  "questionsPerUser": 150,
  "ensureSubjectDistribution": true,
  "subjectQuestionCounts": {
    "Physics": 50,
    "Chemistry": 50,
    "Mathematics": 50
  }
}
```

#### Selected Mode
```json
{
  "title": "Handpicked Questions Test",
  "questionSelectionMode": "selected",
  "questionDeliveryPolicy": "fixed-per-user",
  "selectedQuestionIds": ["q1", "q2", "q3", "..."],
  "questions": ["q1", "q2", "q3", "..."]
}
```

#### Mixed Mode
```json
{
  "title": "Mixed Test",
  "questionSelectionMode": "mixed",
  "questionDeliveryPolicy": "fresh-each-attempt",
  "questionsPerUser": 150,
  "selectedQuestionIds": ["q1", "q2", "..."],
  "ensureSubjectDistribution": true,
  "subjectQuestionCounts": {
    "Physics": 50,
    "Chemistry": 50,
    "Mathematics": 50
  }
}
```

#### Auto-Create with Modes
```json
{
  "title": "Auto JEE Test",
  "category": "jee-main",
  "duration": 180,
  "questionSelectionMode": "random",
  "questionDeliveryPolicy": "fixed-per-user",
  "questionsPerUser": 150,
  "ensureSubjectDistribution": true,
  "subjectQuestionCounts": {
    "Physics": 50,
    "Chemistry": 50,
    "Mathematics": 50
  },
  "useExamPattern": false,
  "chapter": "mechanics",
  "difficulty": "medium"
}
```

---

## Delivery Policy Behavior

### fixed-per-user (Default)
- First attempt: User gets a randomized set based on mode
- Subsequent attempts: Backend delivers the **same set** to maintain consistency
- Resume: Keeps the same in-progress set
- Use case: Fair comparison across users, tracking performance

### fresh-each-attempt
- First attempt: Backend creates a randomized set
- Subsequent attempts: Backend can generate a **different** randomized set
- Resume: Keeps the same in-progress set until completion
- Use case: Practice mode, unlimited attempts with variety

---

## Frontend Validation Rules

### Random Mode
- ✅ `questionsPerUser` must be > 0
- ❌ `selectedQuestionIds` should NOT be sent
- ✅ Can enable subject distribution

### Selected Mode
- ✅ `selectedQuestionIds.length` must be > 0
- ❌ `questionsPerUser` NOT applicable
- ❌ `ensureSubjectDistribution` NOT applicable
- ✅ Backend uses ONLY selected questions

### Mixed Mode
- ✅ `selectedQuestionIds.length` > 0 AND
- ✅ `questionsPerUser` > `selectedQuestionIds.length`
- ✅ Can enable subject distribution
- ✅ Remainder = `questionsPerUser - selectedQuestionIds.length`

---

## Error Handling

| HTTP Status | Frontend Action |
|-------------|-----------------|
| 400 | Show validation error message from server in toast |
| 401 | Redirect to login (auth context handles) |
| 403 | Show "Permission denied" error|
| 404 | Show "Test not found" error |
| 500 | Show "Server error" and suggest retry |

---

## Files Modified

### ✅ Completed
1. `/lib/services/test.service.ts` - Types extended
2. `/lib/validations/test-series-schema.ts` - Validation schema created
3. `/app/(dashboard)/test-series/create/page.tsx` - Full UI with all features

### ⏳ Pending
4. `/app/(dashboard)/test-series/page.tsx` - Auto-create form update
5. `/app/(dashboard)/test-series/[id]/edit/page.tsx` - Edit page update
6. `TEST_SERIES_MODES_QA.md` - QA test guide

---

## Next Steps

1. Update auto-create form with new fields
2. Update edit page with same logic as create page
3. Test all three modes in create flow
4. Test delivery policies
5. Test subject distribution
6. Verify backend accepts all payload combinations
7. Create QA test scenarios

---

## Development Notes

### Type Safety
- Using `as any` in form resolver due to optional field handling by react-hook-form
- Payload construction uses conditional fields based on mode
- Backend should validate mode-specific payload requirements

### Dynamic Rendering
- Questions section text changes based on selected mode
- Subject distribution UI only shows when checkbox enabled and mode is random/mixed
- Form validation happens before submit (frontend) and server validates too

### Future Enhancements
- Drag-to-reorder selected questions
- Bulk select/deselect for question selector
- Question preview with difficulty stats
- Subject-wise question count validation
- Exam pattern auto-fill for modes
