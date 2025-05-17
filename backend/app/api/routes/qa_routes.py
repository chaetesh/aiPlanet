from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.schemas import QuestionRequest, QuestionResponse
from app.services.qa_service import QAService
from app.models.models import Document

router = APIRouter()
qa_service = QAService()


@router.post("/question", response_model=QuestionResponse)
async def ask_question(
    question_req: QuestionRequest,
    db: Session = Depends(get_db)
):
    """
    Ask a question about a document
    """
    # Get document
    document = db.query(Document).filter(
        Document.id == question_req.document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    # Generate answer
    try:
        answer = qa_service.generate_answer(
            question=question_req.question,
            file_path=document.file_path
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error generating answer: {str(e)}")

    return QuestionResponse(
        question=question_req.question,
        answer=answer,
        document_id=question_req.document_id
    )
