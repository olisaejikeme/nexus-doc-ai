import os
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_pinecone import PineconeVectorStore
from langchain_groq import ChatGroq
from langchain_core.runnables import RunnablePassthrough
from langchain_core.prompts import ChatPromptTemplate

load_dotenv()

app = FastAPI()

# 1. CORS Setup (The "Permission" Bridge)
# This allows our Frontend (port 3000) to talk to our Backend (port 8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "NexusDoc API is running"}


# Initialize the Embedding Model
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    # Save the file temporarily
    temp_path = f"temp_{file.filename}"
    with open(temp_path, "wb") as f:
        f.write(await file.read())
        
    # Extract Text
    loader = PyPDFLoader(temp_path)
    docs = loader.load()
    
    # Split text into manageable pieces
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = text_splitter.split_documents(docs)
    
    # Upsert to Pinecone
    index_name = "nexus-doc"
    vectorstore = PineconeVectorStore.from_documents(
        chunks, 
        embeddings, 
        index_name=index_name
    )
    
    # Clean up the temp file
    os.remove(temp_path)

    return {"status": "Success", "chunks_processed": len(chunks)}

# Initialize the Brain (Llama 3 via Groq)
llm = ChatGroq(
    temperature=0, 
    model_name="llama-3.1-8b-instant", 
    groq_api_key=os.getenv("GROQ_API_KEY")
)

@app.post("/chat")
async def chat_with_docs(question: str):
    # Connect to the existing Pinecone index
    vectorstore = PineconeVectorStore(
        index_name="nexus-doc", 
        embedding=embeddings
    )
    
    # Create a Retriever (This line was missing)
    retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
    
    # Create a prompt template
    prompt = ChatPromptTemplate.from_template("""
    Answer the following question based on the provided context:
    
    Context: {context}
    
    Question: {input}
    
    Answer: 
    """)
    
    def format_docs(docs):
        return "\n\n".join(doc.page_content for doc in docs)

    retrieved_docs = retriever.invoke(question)
    formatted_context = format_docs(retrieved_docs)

    # Pass the formatted context and the question to the chain
    # Note: We match the prompt variable name "input" here
    response = (prompt | llm).invoke({
        "context": formatted_context,
        "input": question 
    })

    return {
        "answer": response.content,
        "sources": [doc.metadata.get("source") for doc in retrieved_docs]
    }