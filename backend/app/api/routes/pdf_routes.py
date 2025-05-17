from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.schemas.schemas import DocumentCreate, DocumentResponse
from app.services.pdf_service import PDFService
from app.services.qa_service import QAService
from app.models.models import Document

router = APIRouter()
qa_service = QAService()


@router.post("/documents/upload", response_model=DocumentResponse)
async def upload_pdf(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload a PDF document
    """
    # Save file
    file_location = await PDFService.save_upload_file(file)

    # Create document in database
    db_document = Document(
        filename=file.filename,
        file_path=file_location
    )
    db.add(db_document)
    db.commit()
    db.refresh(db_document)

    # Process document in background for faster API response
    # In a production app, you would use a background task or a queue
    # But for simplicity, we'll process it here
    try:
        qa_service.process_document(file_location)
    except Exception as e:
        # Log error but don't fail the upload
        print(f"Error processing document: {str(e)}")

    return db_document


@router.get("/documents", response_model=List[DocumentResponse])
async def get_all_documents(db: Session = Depends(get_db)):
    """
    Get all documents
    """
    documents = db.query(Document).all()
    return documents


@router.get("/documents/{document_id}", response_model=DocumentResponse)
async def get_document(document_id: int, db: Session = Depends(get_db)):
    """
    Get a document by ID
    """
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return document
