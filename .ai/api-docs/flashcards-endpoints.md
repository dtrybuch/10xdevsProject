# Flashcards API Endpoints

This document provides detailed information about the Flashcards API endpoints, including request parameters, response formats, and error handling.

## Get Flashcards

Retrieves a paginated list of flashcards for the authenticated user.

### Request

- **URL**: `/api/flashcards/getFlashcards`
- **Method**: `GET`
- **Authentication**: Required
- **Query Parameters**:
  - `page` (optional, number): Page number for pagination, starting at 1. Default: 1
  - `pageSize` (optional, number): Number of flashcards per page. Must be positive and maximum 100. Default: 10

### Responses

- **Success Response**:
  - **Code**: 200 OK
  - **Content**: Array of FlashcardDTO objects
  
  ```json
  [
    {
      "id": 1,
      "front": "Question text",
      "back": "Answer text",
      "type": "manual",
      "knowledge_status": "new",
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z",
      "last_review_date": null
    },
    // More flashcards...
  ]
  ```

- **Error Responses**:
  - **Code**: 400 Bad Request
    - **Content**: When validation of query parameters fails
    ```json
    {
      "error": "Validation failed",
      "details": {
        "page": ["Expected number, received null"],
        "pageSize": ["Number must be less than or equal to 100"]
      }
    }
    ```
  
  - **Code**: 401 Unauthorized
    - **Content**: When user is not authenticated
    ```json
    {
      "error": "Unauthorized"
    }
    ```
  
  - **Code**: 500 Internal Server Error
    - **Content**: When an unexpected error occurs on the server
    ```json
    {
      "error": "Internal Server Error"
    }
    ```

### Example

```
GET /api/flashcards/getFlashcards?page=1&pageSize=10
```

## Delete Flashcard

Deletes a specific flashcard by its ID. The authenticated user must be the owner of the flashcard.

### Request

- **URL**: `/api/flashcards/deleteFlashcard`
- **Method**: `DELETE`
- **Authentication**: Required
- **Query Parameters**:
  - `id` (required, number): ID of the flashcard to delete

### Responses

- **Success Response**:
  - **Code**: 204 No Content
  - **Content**: None

- **Error Responses**:
  - **Code**: 400 Bad Request
    - **Content**: When flashcard ID is invalid
    ```json
    {
      "error": "Invalid flashcard ID",
      "details": [
        {
          "code": "invalid_type",
          "expected": "number",
          "received": "string",
          "path": [],
          "message": "Expected number, received string"
        }
      ]
    }
    ```
  
  - **Code**: 401 Unauthorized
    - **Content**: When user is not authenticated
    ```json
    {
      "error": "Unauthorized"
    }
    ```
  
  - **Code**: 403 Forbidden
    - **Content**: When user is not the owner of the flashcard
    ```json
    {
      "error": "Permission denied"
    }
    ```
  
  - **Code**: 404 Not Found
    - **Content**: When flashcard with the given ID does not exist
    ```json
    {
      "error": "Flashcard not found"
    }
    ```
  
  - **Code**: 500 Internal Server Error
    - **Content**: When an unexpected error occurs on the server
    ```json
    {
      "error": "Internal server error"
    }
    ```

### Example

```
DELETE /api/flashcards/deleteFlashcard?id=123
```

## Service Implementation Details

### getUserFlashcards

The `getUserFlashcards` service function implements paginated retrieval of flashcards:

- Performs proper validation of pagination parameters
- Calculates correct offset and range for Supabase query
- Handles error conditions gracefully
- Returns flashcards with total count for pagination support

### deleteFlashcard

The `deleteFlashcard` service function implements secure flashcard deletion:

- Verifies that the flashcard exists and belongs to the requesting user
- Performs type conversion for string IDs
- Implements a single transaction approach for verification and deletion
- Returns clear success/error status with informative messages 