import os
import time

from langchain_core.messages import HumanMessage, AIMessage
from langchain_community.document_loaders import PyPDFLoader
from langchain_huggingface import HuggingFaceEndpointEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_pinecone import PineconeVectorStore
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate

from configs.settings import settings


class AIService:
    def __init__(self):
        # HuggingFace Endpoint
        self.embeddings = HuggingFaceEndpointEmbeddings(
            repo_id="sentence-transformers/all-MiniLM-L6-v2",
            huggingfacehub_api_token=settings.huggingface_api_token
        )

        # LLM
        self.llm = ChatGroq(
            temperature=0.1,
            model_name="llama-3.1-8b-instant",
            groq_api_key=settings.groq_api_key
        )

        self.index_name = "nexus-doc"

    # Retry wrapper to fix HF instability
    def _safe_add_documents(self, vectorstore, chunks, retries=3):
        for attempt in range(retries):
            try:
                vectorstore.add_documents(chunks)
                return
            except Exception as e:
                if attempt == retries - 1:
                    raise e
                time.sleep(2)  # small backoff

    async def process_and_index(self, file_path: str):
        loader = PyPDFLoader(file_path)
        docs = loader.load()

        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50
        )
        chunks = text_splitter.split_documents(docs)

        # Add metadata (important for source tracking)
        for chunk in chunks:
            chunk.metadata["source"] = os.path.basename(file_path)

        # Proper vectorstore usage (no recreation issues)
        vectorstore = PineconeVectorStore(
            index_name=self.index_name,
            embedding=self.embeddings
        )

        # Safe add
        self._safe_add_documents(vectorstore, chunks)

        return len(chunks)

    async def chat(self, question: str, history: list = None):
        vectorstore = PineconeVectorStore(
            index_name=self.index_name,
            embedding=self.embeddings
        )

        retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

        # Format chat history
        formatted_history = []
        if history:
            for msg in history[-6:]:
                if msg["role"] == "user":
                    formatted_history.append(HumanMessage(content=msg["content"]))
                else:
                    formatted_history.append(AIMessage(content=msg["content"]))

        # Prompt
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are NexusDoc Intelligence. Answer ONLY from the provided context. If not found, say you don't know."),
            ("placeholder", "{chat_history}"),
            ("user", "Context:\n{context}\n\nQuestion: {input}")
        ])

        # Retrieve docs
        docs = retriever.invoke(question)
        context = "\n\n".join(d.page_content for d in docs)

        # Run chain
        chain = prompt | self.llm
        response = chain.invoke({
            "context": context,
            "input": question,
            "chat_history": formatted_history
        })

        return {
            "answer": response.content,
            "sources": list(set([
                d.metadata.get("source", "Unknown") for d in docs
            ]))
        }