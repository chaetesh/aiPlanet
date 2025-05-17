import os
import fitz  # PyMuPDF
import uuid
from fastapi import UploadFile, HTTPException

from app.core.config import settings


class PDFService:
    @staticmethod
    async def save_upload_file(upload_file: UploadFile) -> str:
        """
        Save uploaded PDF file to disk
        """
        if not upload_file.filename.endswith(".pdf"):
            raise HTTPException(
                status_code=400, detail="Only PDF files are allowed")

        # Create unique filename
        file_extension = os.path.splitext(upload_file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_location = os.path.join(settings.UPLOAD_DIR, unique_filename)

        # Save file
        try:
            with open(file_location, "wb") as buffer:
                content = await upload_file.read()

                # Check file size
                if len(content) > settings.MAX_FILE_SIZE:
                    raise HTTPException(
                        status_code=400, detail="File size exceeded maximum limit")

                buffer.write(content)
            return file_location
        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Could not save file: {str(e)}")

    @staticmethod
    def extract_text_from_pdf(file_path: str) -> str:
        """
        Extract text content from a PDF file
        """
        try:
            doc = fitz.open(file_path)
            text = ""
            for page in doc:
                text += page.get_text()
            doc.close()
            return text
        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Error extracting text from PDF: {str(e)}")
