import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { LoadingIndicator } from "./ui/loading-indicator.tsx";
import { Document, api } from "../lib/api";

interface DocumentManagerProps {
  onSelectDocument: (document: Document) => void;
  selectedDocumentId?: number;
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({ 
  onSelectDocument,
  selectedDocumentId 
}) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch documents on component mount
  useEffect(() => {
    loadDocuments();
  }, []);
  
  const loadDocuments = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const docs = await api.documents.getAll();
      setDocuments(docs);
      
      // If there are documents but none selected, select the first one
      if (docs.length > 0 && !selectedDocumentId) {
        onSelectDocument(docs[0]);
      }
    } catch (err) {
      setError("Failed to load documents. Please check if the backend server is running.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check if file is PDF
    if (file.type !== 'application/pdf') {
      setError("Only PDF files are supported");
      return;
    }
    
    setIsUploading(true);
    setError(null);
    
    try {
      const uploadedDocument = await api.documents.upload(file);
      setDocuments([...documents, uploadedDocument]);
      onSelectDocument(uploadedDocument);
    } catch (err) {
      setError("Failed to upload document. Please check if the backend server is running.");
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="flex flex-col gap-3 md:gap-4 md:pt-3">
      {/* File upload button */}
      <div className="flex justify-center items-center">
        {/* Centered on both mobile and desktop */}
        <div className={`${!selectedDocumentId ? 'mx-auto' : ''}`}>
          <input
            id="file-upload"
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            className="hidden"
            disabled={isUploading}
          />
          <label htmlFor="file-upload">
            <Button
              variant="outline"
              className="h-8 md:h-[39px] border-black cursor-pointer text-xs md:text-sm md:px-6"
              disabled={isUploading}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <div className="flex items-center gap-2 md:gap-3">
                {isUploading ? (
                  <LoadingIndicator size="small" />
                ) : (
                  <div className="w-[16px] h-[16px] md:w-[18px] md:h-[18px]">
                    <img
                      className="w-[15px] h-[15px] md:w-[17px] md:h-[17px]"
                      alt="Upload icon"
                      src="/group-1.png"
                    />
                  </div>
                )}
                <span className="font-semibold text-black">
                  {isUploading ? "Uploading..." : "Upload PDF"}
                </span>
              </div>
            </Button>
          </label>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="text-red-500 text-xs md:text-sm bg-red-50 p-1.5 md:p-2 rounded-md border border-red-200">
          {error}
        </div>
      )}
      
      {/* Document list */}
      <div className="flex flex-col gap-1.5 md:gap-2 mt-2">
        {isLoading ? (
          <div className="flex justify-center items-center p-3 md:p-4">
            <LoadingIndicator />
          </div>
        ) : documents.length === 0 ? (
          <div className="text-gray-500 text-xs md:text-sm p-3 md:p-4 text-center">
            No documents uploaded yet. Upload a PDF to get started.
          </div>
        ) : (
          documents.map((doc) => (
            <div 
              key={doc.id} 
              className={`flex items-center gap-2 md:gap-2.5 p-1.5 md:p-2 rounded-md cursor-pointer ${
                selectedDocumentId === doc.id ? "bg-slate-100" : "hover:bg-slate-50"
              }`}
              onClick={() => onSelectDocument(doc)}
            >
              <div className="p-1.5 md:p-[7.84px] bg-white rounded-[3.92px] overflow-hidden border-[0.78px] border-solid border-[#0fa95870]">
                <img
                  className="w-3 h-4 md:w-[14.44px] md:h-[18.23px]"
                  alt="PDF icon"
                  src="/group.png"
                />
              </div>
              <span className="font-medium text-[#0fa958] text-xs md:text-sm truncate">
                {doc.filename}
              </span>
            </div>
          ))
        )}
      </div>
      
      {/* Refresh button */}
      {!isLoading && (
        <Button 
          variant="ghost" 
          className="text-xs md:text-sm flex items-center gap-1 md:gap-2 justify-center mt-3 h-8 md:h-10"
          onClick={loadDocuments}
          disabled={isLoading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M3 21v-5h5" />
          </svg>
          Refresh
        </Button>
      )}
    </div>
  );
};
