// API client for the PDF Q&A backend service

// Base API URL
const API_BASE_URL = 'https://aiplanet-ncl7.onrender.com';

// Types
export interface Document {
  id: number;
  filename: string;
  file_path: string;
  created_at: string;
}

export interface Question {
  document_id: number;
  question: string;
}

export interface Answer {
  question: string;
  answer: string;
  document_id: number;
}

// API functions
export const api = {
  // Document Management
  documents: {
    // Upload a PDF document
    upload: async (file: File): Promise<Document> => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/api/documents/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to upload document: ${response.statusText}`);
      }

      return response.json();
    },

    // List all documents
    getAll: async (): Promise<Document[]> => {
      const response = await fetch(`${API_BASE_URL}/api/documents`);

      if (!response.ok) {
        throw new Error(`Failed to get documents: ${response.statusText}`);
      }

      return response.json();
    },

    // Get document by ID
    getById: async (id: number): Promise<Document> => {
      const response = await fetch(`${API_BASE_URL}/api/documents/${id}`);

      if (!response.ok) {
        throw new Error(`Failed to get document: ${response.statusText}`);
      }

      return response.json();
    },
  },

  // Question & Answer
  qa: {
    // Ask a question
    askQuestion: async (question: Question): Promise<Answer> => {
      const response = await fetch(`${API_BASE_URL}/api/question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(question),
      });

      if (!response.ok) {
        throw new Error(`Failed to get answer: ${response.statusText}`);
      }

      return response.json();
    },
  },
};
