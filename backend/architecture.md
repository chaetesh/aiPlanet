# AI Planet - Technical Architecture Documentation

## Overview
AI Planet is a full-stack application that enables users to upload PDF documents and interact with them through an AI-powered question-answering system. The application uses modern technologies including FastAPI, React, LangChain, and Google's Generative AI.

### Components Description:

1. **FastAPI Application**
   - Main entry point handling HTTP requests
   - Routes configuration and middleware

2. **PDF Service**
   - Handles PDF file upload and processing
   - Extracts text from PDFs
   - Creates vector embeddings
   - Manages file storage

3. **QA Service**
   - Processes questions
   - Retrieves relevant context from vector store
   - Interacts with Google Generative AI
   - Formats responses

4. **Storage Components**
   - SQLite Database: Stores metadata and file information
   - FAISS Vector Store: Stores document embeddings
   - Local File System: Stores PDF files (⚠️ Warning: ephemeral in Render deployment)

5. **External Services**
   - Google Generative AI: Provides LLM capabilities

## Detailed Component Breakdown

### 1. Frontend Architecture (`/frontend`)
- **Technology Stack**: React, TypeScript, Tailwind CSS, Vite
- **Key Components**:
  - `DocumentManager.tsx`: Handles PDF file uploads and document listing
  - `Chat.tsx`: Manages the Q&A interface and conversation flow
  - `lib/api.ts`: Central API client for backend communication
  - UI Components: Reusable components like buttons, cards, and inputs

### 2. Backend Architecture (`/backend`)
#### Core Components (`/app/core`)
- `config.py`: Application configuration and environment variables

#### API Layer (`/app/api/routes`)
- `pdf_routes.py`: Endpoints for PDF upload and management
- `qa_routes.py`: Endpoints for question-answering functionality

#### Database Layer (`/app/db`)
- `base.py`: SQLAlchemy ORM base configuration
- `session.py`: Database session management
- Uses SQLite for data persistence

#### Models and Schemas (`/app/models`, `/app/schemas`)
- `models.py`: SQLAlchemy ORM models
- `schemas.py`: Pydantic models for request/response validation

#### Services (`/app/services`)
- **PDF Service** (`pdf_service.py`):
  - PDF file handling and storage
  - Text extraction
  - Vector embedding generation
  - FAISS vector store management
  
- **QA Service** (`qa_service.py`):
  - Question processing
  - Context retrieval from vector store
  - Integration with Google Generative AI
  - Answer generation and formatting

### 3. Data Flow
1. **Document Processing Flow**:
   ```
   Upload PDF → Save File → Extract Text → Generate Embeddings → Store in FAISS → Save Metadata
   ```

2. **Question-Answering Flow**:
   ```
   Ask Question → Retrieve Context → Query AI Model → Process Response → Return Answer
   ```

### 4. Storage Systems
1. **File Storage**:
   - PDF files stored in `/uploads` directory
   - Each PDF gets a unique UUID filename

2. **Vector Storage**:
   - FAISS vector store for each document
   - Stored in document-specific directories
   - Format: `{document_id}_vector_store/`

3. **Database**:
   - SQLite database (`pdf_qa.db`)
   - Stores document metadata and relationships

### 5. External Integrations
- **Google Generative AI**:
  - Used for natural language understanding
  - Processes questions and generates answers
  - Integrated through LangChain