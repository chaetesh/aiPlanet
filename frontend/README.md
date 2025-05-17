# PDF Q&A Backend API

A FastAPI backend service that allows users to upload PDF documents and ask questions about their content using AI-powered document analysis with Gemini API.

## Features

- Upload and manage PDF documents
- Extract text content from PDFs
- Process and vectorize document content for efficient retrieval
- Ask natural language questions about document content
- Get AI-generated answers based on document context

## Tech Stack

- **Backend**: FastAPI
- **Database**: SQLite
- **Text Processing**: LangChain, Google Generative AI (Gemini)
- **Vector Database**: FAISS (for document embeddings and similarity search)
- **PDF Processing**: PyMuPDF

## API Endpoints

### Document Management

#### 1. Upload a PDF Document
- **Endpoint**: `POST /api/documents/upload`
- **Description**: Upload a PDF document to the system
- **Request**: 
  - Form Data: `file` (PDF file)
- **Response**: 
  ```json
  {
    "id": 1,
    "filename": "example.pdf",
    "file_path": "/path/to/file.pdf",
    "created_at": "2025-05-15T12:00:00"
  }
  ```

#### 2. List All Documents
- **Endpoint**: `GET /api/documents`
- **Description**: Get a list of all uploaded documents
- **Response**: 
  ```json
  [
    {
      "id": 1,
      "filename": "example1.pdf",
      "file_path": "/path/to/file1.pdf",
      "created_at": "2025-05-15T12:00:00"
    },
    {
      "id": 2,
      "filename": "example2.pdf",
      "file_path": "/path/to/file2.pdf",
      "created_at": "2025-05-15T13:00:00"
    }
  ]
  ```

#### 3. Get Document by ID
- **Endpoint**: `GET /api/documents/{document_id}`
- **Description**: Get details of a specific document
- **Response**: 
  ```json
  {
    "id": 1,
    "filename": "example.pdf",
    "file_path": "/path/to/file.pdf",
    "created_at": "2025-05-15T12:00:00"
  }
  ```

### Question & Answer

#### 1. Ask a Question
- **Endpoint**: `POST /api/question`
- **Description**: Ask a question about a document's content
- **Request**:
  ```json
  {
    "document_id": 1,
    "session_id": "optional-session-id",
    "question": "What is the main topic of this document?"
  }
  ```
- **Response**:
  ```json
  {
    "session_id": "session-uuid",
    "question": "What is the main topic of this document?",
    "answer": "The main topic of this document is...",
    "document_id": 1
  }
  ```

The React app will run on http://localhost:3000 and communicate with the FastAPI backend running on http://localhost:8000.

## Development Notes

1. For production, ensure proper security measures:
   - Replace `allow_origins=["*"]` with your specific frontend domain
   - Add authentication/authorization
   - Consider using environment variables for API keys and other secrets

2. Error handling:
   - Implement more robust error handling on both frontend and backend
   - Add loading states for better user experience

3. File size limits:
   - The backend has a file size limit configured in settings
   - Consider implementing client-side file size validation as well

4. Session management:
   - The Q&A API supports sessions for follow-up questions
   - Save session IDs in local storage or state management for persistent sessions
