from pydantic import BaseModel
from datetime import datetime


class DocumentBase(BaseModel):
    filename: str


class DocumentCreate(DocumentBase):
    pass


class DocumentResponse(DocumentBase):
    id: int
    file_path: str
    created_at: datetime

    class Config:
        orm_mode = True


class QuestionRequest(BaseModel):
    document_id: int
    question: str


class QuestionResponse(BaseModel):
    question: str
    answer: str
    document_id: int
