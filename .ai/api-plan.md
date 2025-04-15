# REST API Plan

## 1. Resources

### 1.1 Flashcards
- Corresponds to the `flashcards` table in the database.
- Attributes:
  - `id`: Identifier of the flashcard (BIGSERIAL).
  - `user_id`: Reference to the user (UUID).
  - `front`: The question/prompt (VARCHAR(200)); must be ≤ 200 characters.
  - `back`: The answer (VARCHAR(500)); must be ≤ 500 characters.
  - `type`: Indicates source of flashcard; allowed values are 'AI' or 'manual'.
  - `knowledge_status`: Status field for learning progress.
  - `last_review_date`: Timestamp for the last review.
  - `created_at` & `updated_at`: Timestamps for record creation and update.

### 1.2 Generation Error Logs
- Corresponds to the `generation_error_logs` table in the database.
- Attributes:
  - `id`: Identifier (BIGSERIAL).
  - `user_id`: Reference to the user (UUID).
  - `model`: The model used for generation (VARCHAR).
  - `source_text_hash`: Hash of the input text.
  - `source_text_length`: Length of the input text (must be between 1000 and 10000).
  - `error_code`: Error code description.
  - `error_message`: Detailed error message.
  - `created_at`: Timestamp of error log creation.

### 1.3 Generation Sessions
- Corresponds to the `generation_sessions` table in the database.
- Attributes:
  - `id`: Identifier (BIGSERIAL).
  - `user_id`: Reference to the user (UUID).
  - `session_duration`: Duration of the study session (INTERVAL).
  - `accepted_count`, `edited_count`, `rejected_count`: Counters for flashcard actions.
  - `created_at`: Timestamp of session creation.

## 2. Endpoints

The API endpoints are designed to provide full CRUD functionality and business logic operations as defined in the PRD. Endpoints utilize standard HTTP methods and JSON payloads.

### 2.1 Flashcards Endpoints

1. **List Flashcards**
   - Method: `GET`
   - URL: `/flashcards`
   - Description: Retrieves a paginated list of a user's flashcards with options for filtering and sorting.
   - Query Parameters:
     - `page` (optional): Page number for pagination.
     - `pageSize` (optional): Number of items per page.
   - Response: JSON array of flashcard objects.
   - Success Codes: 200 OK
   - Error Codes: 401 Unauthorized, 400 Bad Request

2. **Get Flashcard Details**
   - Method: `GET`
   - URL: `/flashcards/{id}`
   - Description: Retrieves details for a specific flashcard by its ID.
   - Response: JSON object of the flashcard.
   - Success Codes: 200 OK
   - Error Codes: 404 Not Found, 401 Unauthorized

3. **Create Flashcard**
   - Method: `POST`
   - URL: `/flashcards`
   - Description: Creates a new flashcard (both manual creation or accepting an AI-generated candidate).
   - Request Payload (JSON):
     ```json
     {
       "front": "string (max 200 chars)",
       "back": "string (max 500 chars)",
       "type": "string ('AI' or 'manual')",
       "knowledge_status": "string (optional)"
     }
     ```
   - Response: JSON object of the created flashcard.
   - Success Codes: 201 Created
   - Error Codes: 400 Bad Request, 401 Unauthorized

4. **Update Flashcard**
   - Method: `PUT` or `PATCH`
   - URL: `/flashcards/{id}`
   - Description: Updates an existing flashcard's details.
   - Request Payload (JSON): Partial or full flashcard data with same validations as creation.
   - Response: JSON object of the updated flashcard.
   - Success Codes: 200 OK
   - Error Codes: 400 Bad Request, 404 Not Found, 401 Unauthorized

5. **Delete Flashcard**
   - Method: `DELETE`
   - URL: `/flashcards/{id}`
   - Description: Deletes the specified flashcard.
   - Response: Success message or empty response.
   - Success Codes: 200 OK or 204 No Content
   - Error Codes: 404 Not Found, 401 Unauthorized

6. **Generate Flashcards candidates via AI**
   - Method: `POST`
   - URL: `/generations`
   - Description: Accepts pasted text (up to 10,000 characters) and returns AI-generated flashcard candidates.
   - Request Payload (JSON):
     ```json
     {
       "text": "string (max 10,000 chars)"
     }
     ```
   - Response: JSON array of candidate flashcard objects.
   - Success Codes: 200 OK
   - Error Codes: 400 Bad Request, 401 Unauthorized, 500 Internal Server Error


### 2.2 Generation Error Logs Endpoints

1. **List Generation Error Logs**
   - Method: `GET`
   - URL: `/logs/generation-errors`
   - Description: Retrieves a paginated list of AI generation error logs for the authenticated user.
   - Query Parameters: Similar pagination parameters as flashcards endpoint.
   - Response: JSON array of error log objects.
   - Success Codes: 200 OK
   - Error Codes: 401 Unauthorized, 400 Bad Request

*Note: Typically, error logs are created automatically by the system, and this endpoint is for review or debugging purposes.*

### 2.3 Generation Sessions Endpoints

1. **List Generation Sessions**
   - Method: `GET`
   - URL: `/sessions`
   - Description: Retrieves all study session records for the authenticated user.
   - Response: JSON array of session objects.
   - Success Codes: 200 OK
   - Error Codes: 401 Unauthorized

2. **Create / Record a Session**
   - Method: `POST`
   - URL: `/sessions`
   - Description: Creates a new study session record; intended to log session duration and flashcard review outcomes (accepted, edited, rejected counts).
   - Request Payload (JSON):
     ```json
     {
       "session_duration": "string (ISO 8601 duration format)",
       "accepted_count": "number (optional)",
       "edited_count": "number (optional)",
       "rejected_count": "number (optional)"
     }
     ```
   - Response: JSON object of the created session.
   - Success Codes: 201 Created
   - Error Codes: 400 Bad Request, 401 Unauthorized

3. **Get Session Details**
   - Method: `GET`
   - URL: `/sessions/{id}`
   - Description: Retrieves detailed information for a specific study session.
   - Response: JSON object with session details.
   - Success Codes: 200 OK
   - Error Codes: 404 Not Found, 401 Unauthorized

## 3. Authentication and Authorization

- All endpoints (except `/auth/*`) require authentication via a Bearer token (JWT).
- The API leverages Supabase Auth, which automatically integrates user sessions.
- Database Row Level Security (RLS) policies enforce that users can only access records matching their `user_id`.

## 4. Validation and Business Logic

- **Input Validation:**
  - Flashcards: Ensure `front` is ≤ 200 characters and `back` is ≤ 500 characters.
  - Generated text for AI flashcard generation: Maximum 10,000 characters.
  - Generation error logs: `source_text_length` must be between 1000 and 10000.
  - Flashcard `type` must be either "AI" or "manual".

- **Business Logic:**
  - AI Flashcard Generation: Accepts pasted text and communicates with an external LLM service to generate candidate flashcards (US-002 & US-003).
  - Flashcard Review Process: Users can accept, edit, or reject AI-generated flashcards candidates (US-004), which triggers corresponding state changes in the database.
  - Manual Flashcard Creation: Users can create and edit flashcards directly through the API (US-005 & US-006).
  - Study Session Integration: Accepted flashcards are passed to a spaced repetition algorithm to initiate study sessions (US-007).
  - Event Logging: Significant operations (generation, acceptance, rejection) are logged for audit and debugging purposes (US-008).

## 5. Security and Performance Considerations

- **Security:**
  - Use HTTPS for all API communications.
  - Authentication via JWT ensures that only authorized users can access endpoints.
  - RLS in the database reinforces that users only interact with their own data.
  - Rate limiting and input sanitization to mitigate abuse and injection attacks.

- **Performance:**
  - Pagination and query parameter filtering to ensure efficient data retrieval.
  - Database indexes on `user_id` in all tables to optimize query performance.
  - Caching strategies could be applied to frequently accessed endpoints (e.g., study session flashcards).

---

This REST API plan comprehensively maps the database schema and PRD functional requirements to a set of clear, RESTful endpoints embracing the chosen tech stack. It ensures proper validation, business logic enforcement, security, and performance throughout the API lifecycle. 