import os
import google.generativeai as genai
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_core.prompts import ChatPromptTemplate
from langchain_community.vectorstores import FAISS
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

from app.core.config import settings
from app.services.pdf_service import PDFService

# Configure the Gemini API
genai.configure(api_key=settings.GOOGLE_API_KEY)


class QAService:
    def __init__(self):
        self.embeddings = GoogleGenerativeAIEmbeddings(
            model="models/embedding-001")
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
        )
        self.llm = ChatGoogleGenerativeAI(
            model="models/gemini-2.0-flash",
            temperature=0.1,
            google_api_key=settings.GOOGLE_API_KEY,
        )

        # Define the prompt template for question answering
        self.prompt = ChatPromptTemplate.from_template("""
        Answer the question based only on the following context:
        
        {context}
        
        Question: {question}
        """)

        # Create the QA chain using the new approach
        self.qa_chain = (
            {"context": lambda input_dict: self._format_docs(input_dict["input_documents"]),
             "question": lambda input_dict: input_dict["question"]}
            | self.prompt
            | self.llm
            | StrOutputParser()
        )

    def _format_docs(self, docs):
        """Format the document chunks into a single string."""
        return "\n\n".join(doc.page_content for doc in docs)

    def process_document(self, file_path: str):
        """
        Process the PDF document and create a vector store for retrieval
        """
        # Extract text from PDF
        text = PDFService.extract_text_from_pdf(file_path)

        # Split text into chunks
        chunks = self.text_splitter.split_text(text)

        # Create vector store
        vector_store = FAISS.from_texts(chunks, self.embeddings)

        # Save vector store for future use
        vector_store_path = f"{os.path.splitext(file_path)[0]}_vector_store"
        vector_store.save_local(vector_store_path)

        return vector_store_path

    def generate_answer(self, question: str, file_path: str):
        """
        Generate answer for a question using the processed document
        """
        # Load vector store
        vector_store_path = f"{os.path.splitext(file_path)[0]}_vector_store"

        if not os.path.exists(vector_store_path):
            # If vector store doesn't exist, process the document first
            vector_store_path = self.process_document(file_path)

        # Load the vector store with explicit permission to deserialize
        vector_store = FAISS.load_local(
            vector_store_path,
            self.embeddings,
            # Only safe because we created these files ourselves
            allow_dangerous_deserialization=True
        )

        # Search for similar documents
        docs = vector_store.similarity_search(question, k=4)

        # Generate answer using the QA chain
        answer = self.qa_chain.invoke({
            "input_documents": docs,
            "question": question
        })

        return answer
